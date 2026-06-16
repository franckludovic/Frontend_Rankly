import * as ort from 'onnxruntime-web'

const MODEL_VERSION = 'V6'
const MODEL_FILENAME = `seo_classifier_${MODEL_VERSION}_offline.onnx`
const CONFIG_FILENAME = `feature_config_${MODEL_VERSION}_offline.json`

// Global ONNX session cache to avoid reloading the model file on every scan
let modelSession = null

/**
 * Configures the WebAssembly binary paths for the browser extension context.
 * In Manifest V3, these must point to local files copied to the models folder.
 */
function configureWasmPaths() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    ort.env.wasm.wasmPaths = {
      'ort-wasm-simd-threaded.wasm': chrome.runtime.getURL('models/ort-wasm-simd-threaded.wasm'),
      'ort-wasm-simd-threaded.jsep.wasm': chrome.runtime.getURL('models/ort-wasm-simd-threaded.jsep.wasm'),
      'ort-wasm-simd-threaded.jspi.wasm': chrome.runtime.getURL('models/ort-wasm-simd-threaded.jspi.wasm'),
      'ort-wasm-simd-threaded.asyncify.wasm': chrome.runtime.getURL('models/ort-wasm-simd-threaded.asyncify.wasm'),
    }
  }
}

/**
 * Prepares and normalizes scraped DOM data to support standard ML feature mappings.
 * Maps raw DOM strings to lengths, numerical binaries (1/0), and supports both
 * camelCase and snake_case naming conventions.
 */
function normalizeFeatures(scrapedData) {
  const metrics = { ...scrapedData }

  // 1. Calculate length derivatives
  metrics.title_length = scrapedData.title ? scrapedData.title.length : 0
  metrics.titleLength = metrics.title_length

  metrics.meta_desc_length = scrapedData.metaDesc ? scrapedData.metaDesc.length : 0
  metrics.metaDescLength = metrics.meta_desc_length
  metrics.description_length = metrics.meta_desc_length
  metrics.descriptionLength = metrics.meta_desc_length
  metrics.meta_desc_present = scrapedData.metaDesc ? 1.0 : 0.0

  // 2. Normalize word count
  metrics.word_count = scrapedData.wordCount || 0
  metrics.wordCount = metrics.word_count

  // 3. Convert booleans / existence to numeric flags
  metrics.is_https = scrapedData.isHttps ? 1.0 : 0.0
  metrics.isHttps = metrics.is_https

  metrics.has_h1 = scrapedData.h1 ? 1.0 : 0.0
  metrics.hasH1 = metrics.has_h1

  metrics.has_schema_markup = scrapedData.hasSchema ? 1.0 : 0.0
  metrics.hasSchemaMarkup = metrics.has_schema_markup
  metrics.hasSchema = metrics.has_schema_markup

  metrics.has_canonical_tag = scrapedData.canonical ? 1.0 : 0.0
  metrics.hasCanonicalTag = metrics.has_canonical_tag

  metrics.has_viewport_meta = scrapedData.viewport ? 1.0 : 0.0
  metrics.hasViewportMeta = metrics.has_viewport_meta
  metrics.viewport_configured = metrics.has_viewport_meta
  metrics.viewport = metrics.has_viewport_meta

  // 4. Compute derived metrics for the ONNX model inputs
  metrics.optimal_title_length = (metrics.title_length >= 50 && metrics.title_length <= 60) ? 1.0 : 0.0
  metrics.optimal_meta_length = (metrics.meta_desc_length >= 120 && metrics.meta_desc_length <= 160) ? 1.0 : 0.0
  
  metrics.alt_coverage = metrics.image_count > 0 ? (metrics.images_with_alt_count / metrics.image_count) : 0.0
  metrics.heading_density = metrics.total_heading_count > 0 ? (metrics.word_count / metrics.total_heading_count) : 0.0
  
  metrics.keyword_signal_count = (metrics.title_has_keyword || 0) + (metrics.meta_desc_has_keyword || 0) + (metrics.h1_has_keyword || 0)
  
  let techScore = 0.0
  if (metrics.is_https) techScore += 1.0
  if (metrics.has_viewport_meta) techScore += 1.0
  if (metrics.has_canonical_tag) techScore += 1.0
  if (metrics.has_schema_markup) techScore += 1.0
  metrics.technical_score = techScore

  // 5. Proxy features for fields not in content.js
  metrics.semantic_relevance = metrics.tfidf_relevance || 0
  metrics.keyword_prominence_score = metrics.keyword_signal_count > 0
    ? parseFloat((metrics.keyword_signal_count / 3).toFixed(4))
    : 0

  return metrics
}

/**
 * Initializes and loads the offline ONNX session.
 */
export async function initializeLocalModel() {
  if (modelSession) return modelSession

  try {
    console.log('[ModelService] Loading local ONNX model session...')
    configureWasmPaths()
    
    // Disable multi-threading support inside extension sandbox contexts if SharedArrayBuffer issues occur
    ort.env.wasm.numThreads = 1

    const modelUrl = chrome.runtime.getURL('models/' + MODEL_FILENAME)
    modelSession = await ort.InferenceSession.create(modelUrl)
    console.log('[ModelService] ONNX session created successfully.')
    return modelSession
  } catch (err) {
    console.error('[ModelService] Failed to load local ONNX model:', err)
    return null
  }
}

/**
 * Performs local machine learning inference using the loaded ONNX model.
 * 
 * @param {Object} scrapedData - Raw HTML features extracted from content.js
 * @returns {Promise<Object>} The parsed score and metadata
 */
export async function runLocalInference(scrapedData) {
  try {
    const session = await initializeLocalModel()
    if (!session) {
      throw new Error('Local ONNX model session is unavailable.')
    }

    // 1. Fetch the feature config to know the model's exact tensor order
    const configUrl = chrome.runtime.getURL('models/' + CONFIG_FILENAME)
    const configResponse = await fetch(configUrl)
    const config = await configResponse.json()

    // 2. Preprocess and normalize features
    const normalizedMetrics = normalizeFeatures(scrapedData)

    // 3. Map features in the exact order required by the ONNX model inputs
    const inputArray = config.features.map(featName => {
      let val = normalizedMetrics[featName]
      
      // Fallback: Check camelCase format if feature name is snake_case and vice-versa
      if (val === undefined) {
        const camel = featName.replace(/_([a-z])/g, g => g[1].toUpperCase())
        val = normalizedMetrics[camel]
      }
      if (val === undefined) {
        const snake = featName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        val = normalizedMetrics[snake]
      }
      
      // Default to the config feature_median if not found
      if (val === undefined && config.feature_medians) {
        val = config.feature_medians[featName]
      }

      // Default to 0.0 if still not found
      if (val === undefined) return 0.0
      
      if (typeof val === 'boolean') return val ? 1.0 : 0.0
      return parseFloat(val) || 0.0
    })

    console.log('[ModelService] Prepared Input Tensor Array:', inputArray)

    // 4. Create input tensor [batch_size = 1, feature_count]
    const inputTensor = new ort.Tensor(
      'float32', 
      Float32Array.from(inputArray), 
      [1, config.features.length]
    )

    // 5. Run prediction
    const feeds = { [session.inputNames[0]]: inputTensor }
    const results = await session.run(feeds)
    
    // 6. Parse results dynamically (Classifier label, prob list, or Regressor output)
    const outputNames = session.outputNames
    let finalScore = 50 // default fallback score

    if (outputNames.length > 0) {
      const primaryOutput = results[outputNames[0]]
      const rawVal = primaryOutput.data[0]

      if (outputNames.length > 1) {
        // Case A: Classifier returning [Labels, Probabilities]
        const probOutput = results[outputNames[1]]
        if (probOutput && probOutput.data) {
          // If probabilities array contains class probabilities, take index 1 (pass/high)
          const probSuccess = probOutput.data[1] !== undefined ? probOutput.data[1] : probOutput.data[0]
          finalScore = Math.round(probSuccess * 100)
        } else {
          // Label-based fallback
          finalScore = typeof rawVal === 'number' ? (rawVal === 1 ? 85 : 40) : 50
        }
      } else {
        // Case B: Regression or single score output
        if (typeof rawVal === 'number') {
          // Scale from 0.0–1.0 representation if necessary
          finalScore = (rawVal >= 0 && rawVal <= 1) ? Math.round(rawVal * 100) : Math.round(rawVal)
        }
      }
    }

    // Ensure the score stays within 0 and 100 boundaries
    finalScore = Math.min(100, Math.max(0, finalScore))

    return {
      score: finalScore,
      modelName: MODEL_FILENAME,
      pipeline: 'Offline Model (48.6% Accuracy)',
      timestamp: Date.now()
    }
  } catch (err) {
    console.error('[ModelService] Local inference execution failed:', err)
    
    // Heuristic fallback in case of hardware/sandbox WASM failures
    let fallbackScore = 50
    if (scrapedData.title) fallbackScore += 10
    if (scrapedData.metaDesc) fallbackScore += 10
    if (scrapedData.h1) fallbackScore += 10
    if (scrapedData.isHttps) fallbackScore += 10
    if (scrapedData.viewport) fallbackScore += 10
    
    return {
      score: fallbackScore,
      modelName: 'heuristics-fallback',
      pipeline: 'Offline Model (46.5% Accuracy) - Fallback',
      timestamp: Date.now()
    }
  }
}
