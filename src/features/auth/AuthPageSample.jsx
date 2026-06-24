import { useState } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

/* ══ PAGE ══ */
.page{
  min-height:100vh;
  background:
    radial-gradient(ellipse 70% 60% at 80% 0%,   rgba(88,28,255,0.28) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 0%  80%,   rgba(120,10,40,0.35)  0%, transparent 55%),
    radial-gradient(ellipse 80% 80% at 50% 50%,   rgba(5,10,30,0.9)     0%, transparent 100%),
    linear-gradient(160deg, #06091a 0%, #080c22 40%, #060818 100%);
  display:flex;
  flex-direction:column;
  font-family:'Outfit',sans-serif;
  color:white;
  position:relative;
  overflow:hidden;
}

/* subtle noise texture overlay */
.page::before{
  content:'';position:absolute;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  opacity:.4;pointer-events:none;z-index:0;
}

/* ══ NAV ══ */
.nav{
  position:relative;z-index:10;
  padding:22px 40px;
  display:flex;align-items:center;
}
.nav-logo{
  font-family:'Syne',sans-serif;font-size:17px;font-weight:700;
  letter-spacing:-.2px;color:white;
}

/* ══ BODY ROW ══ */
.body-row{
  flex:1;display:flex;align-items:center;
  padding:20px 40px 40px;
  position:relative;z-index:1;
  gap:0;
}

/* ══ LEFT ══ */
.left{
  flex:1;
  display:flex;flex-direction:column;
  justify-content:flex-end;
  padding-bottom:60px;
  max-width:520px;
}

.left-headline{
  font-family:'Syne',sans-serif;
  font-size:clamp(36px,4.5vw,58px);
  font-weight:800;
  line-height:1.05;
  letter-spacing:-1px;
  margin-bottom:18px;
}
.hl-white{color:white;display:block;}
.hl-green{
  color:#1aff7a;
  display:block;
  text-shadow:0 0 40px rgba(26,255,122,.3);
}

.left-sub{
  font-family:'Outfit',sans-serif;
  font-size:15px;line-height:1.65;
  color:rgba(255,255,255,.45);
  max-width:380px;
}

/* ══ RIGHT ══ */
.right{
  flex:0 0 auto;
  width:440px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px;
}

/* ══ CARD ══ */
.card{
  width:100%;
  background:rgba(18,26,56,0.88);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  border:1px solid rgba(255,255,255,.1);
  border-radius:18px;
  overflow:hidden;
  box-shadow:
    0 32px 80px rgba(0,0,0,.6),
    0 0 0 1px rgba(255,255,255,.04) inset;
}

/* Tabs */
.tabs{
  display:grid;grid-template-columns:1fr 1fr;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.tab-btn{
  padding:17px 0;border:none;background:none;
  font-family:'Outfit',sans-serif;font-size:12.5px;
  font-weight:700;letter-spacing:.8px;text-transform:uppercase;
  color:rgba(255,255,255,.3);cursor:pointer;
  position:relative;transition:color .2s;
}
.tab-btn.active{color:#4db8ff;}
.tab-btn.active::after{
  content:'';position:absolute;bottom:0;left:0;right:0;
  height:2px;background:#4db8ff;border-radius:2px 2px 0 0;
}
.tab-sep{width:1px;background:rgba(255,255,255,.08);flex-shrink:0;}

/* Card body */
.card-body{padding:28px 30px 24px;}

.card-title{
  font-family:'Syne',sans-serif;font-size:24px;font-weight:800;
  letter-spacing:-.4px;margin-bottom:5px;
}
.card-sub{font-size:13px;color:rgba(255,255,255,.42);margin-bottom:22px;line-height:1.5;}

/* OAuth */
.oauth-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
.oauth-btn{
  display:flex;align-items:center;justify-content:center;gap:8px;
  padding:11px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.1);
  font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;
  cursor:pointer;transition:all .15s;
}
.oauth-google{
  background:linear-gradient(135deg,rgba(251,188,4,.15),rgba(66,133,244,.15));
  color:rgba(255,255,255,.8);
}
.oauth-google:hover{background:linear-gradient(135deg,rgba(251,188,4,.22),rgba(66,133,244,.22));border-color:rgba(255,255,255,.18);}
.oauth-github{
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.7);
}
.oauth-github:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);}

/* Divider */
.or-divider{display:flex;align-items:center;gap:12px;margin-bottom:18px;}
.or-line{flex:1;height:1px;background:rgba(255,255,255,.08);}
.or-txt{font-family:'DM Mono',monospace;font-size:10px;color:rgba(255,255,255,.22);letter-spacing:.5px;}

/* Field */
.field{margin-bottom:16px;}
.field-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;}
.field-label{
  font-family:'Outfit',sans-serif;font-size:11.5px;font-weight:700;
  letter-spacing:.7px;text-transform:uppercase;color:rgba(255,255,255,.55);
}
.forgot-link{
  font-family:'Outfit',sans-serif;font-size:12px;font-weight:500;
  color:#4db8ff;background:none;border:none;cursor:pointer;
  transition:opacity .15s;
}
.forgot-link:hover{opacity:.7;}

.input-wrap{
  display:flex;align-items:center;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1);
  border-radius:10px;overflow:hidden;
  transition:all .2s;
}
.input-wrap:focus-within{
  border-color:rgba(77,184,255,.45);
  background:rgba(77,184,255,.04);
  box-shadow:0 0 0 3px rgba(77,184,255,.08);
}
.input-icon{
  padding:0 12px;
  color:rgba(255,255,255,.25);
  display:flex;align-items:center;flex-shrink:0;
}
.field-input{
  flex:1;background:none;border:none;outline:none;
  padding:12px 12px 12px 0;
  font-family:'Outfit',sans-serif;font-size:13.5px;
  color:white;
}
.field-input::placeholder{color:rgba(255,255,255,.22);}
.pw-toggle{
  padding:0 12px;background:none;border:none;cursor:pointer;
  color:rgba(255,255,255,.3);display:flex;align-items:center;
  transition:color .15s;
}
.pw-toggle:hover{color:rgba(255,255,255,.6);}

/* Name row */
.name-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}

/* Submit */
.submit-btn{
  width:100%;padding:14px;border-radius:11px;border:none;
  background:linear-gradient(135deg,#2b5ce6,#3b7aff);
  color:white;font-family:'Outfit',sans-serif;font-size:14px;font-weight:700;
  cursor:pointer;transition:all .2s;
  display:flex;align-items:center;justify-content:center;gap:7px;
  margin-bottom:16px;position:relative;overflow:hidden;
  box-shadow:0 4px 24px rgba(43,92,230,.35);
  letter-spacing:.1px;
}
.submit-btn:hover{transform:translateY(-1px);box-shadow:0 8px 32px rgba(43,92,230,.5);}
.submit-btn:active{transform:translateY(0);}
.submit-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.submit-btn::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
  transform:translateX(-100%);transition:transform .6s;
}
.submit-btn:hover::after{transform:translateX(100%);}

/* Legal */
.legal{
  text-align:center;font-family:'Outfit',sans-serif;
  font-size:11.5px;color:rgba(255,255,255,.28);line-height:1.55;
}
.legal a{color:#4db8ff;text-decoration:none;cursor:pointer;}
.legal a:hover{text-decoration:underline;}

/* Terms checkbox */
.terms-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:16px;}
.terms-box{
  width:16px;height:16px;border-radius:4px;border:1.5px solid rgba(255,255,255,.2);
  background:none;cursor:pointer;flex-shrink:0;margin-top:2px;
  display:flex;align-items:center;justify-content:center;transition:all .15s;
}
.terms-box.on{background:#4db8ff;border-color:#4db8ff;}
.terms-txt{font-size:11.5px;color:rgba(255,255,255,.35);line-height:1.5;}
.terms-txt a{color:#4db8ff;}

/* Below card */
.below-card{
  font-family:'Outfit',sans-serif;font-size:13.5px;
  color:rgba(255,255,255,.55);text-align:center;
}
.below-card a{
  color:#1aff7a;font-weight:600;text-decoration:none;cursor:pointer;
}
.below-card a:hover{text-decoration:underline;}

/* ══ FOOTER ══ */
.footer{
  position:relative;z-index:1;
  padding:18px 40px;
  border-top:1px solid rgba(255,255,255,.06);
}
.footer-txt{
  font-family:'DM Mono',monospace;font-size:9.5px;
  letter-spacing:.8px;text-transform:uppercase;
  color:rgba(255,255,255,.18);
}

/* ══ RESPONSIVE ══ */
@media(max-width:900px){
  .body-row{flex-direction:column;align-items:stretch;padding:20px 20px 40px;}
  .left{max-width:100%;padding-bottom:32px;justify-content:flex-start;}
  .right{width:100%;}
}
@media(max-width:480px){
  .nav{padding:18px 20px;}
  .card-body{padding:22px 20px 20px;}
  .left-headline{font-size:32px;}
  .name-row{grid-template-columns:1fr;}
}

@keyframes spin{to{transform:rotate(360deg);}}
`;

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,.75)">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const EyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function AuthPage() {
  const [mode,     setMode]     = useState("login");
  const [showPw,   setShowPw]   = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [first,    setFirst]    = useState("");
  const [last,     setLast]     = useState("");

  const isLogin  = mode === "login";
  const isSignup = mode === "signup";

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="page">

        {/* Nav */}
        <nav className="nav">
          <div className="nav-logo">SEO Insight</div>
        </nav>

        {/* Body */}
        <div className="body-row">

          {/* Left */}
          <div className="left">
            <h1 className="left-headline">
              <span className="hl-white">Data-Driven SEO.</span>
              <span className="hl-green">Powered by AI.</span>
            </h1>
            <p className="left-sub">
              Stop guessing. Start ranking. Let our engine analyse your
              competitors and give you the exact HTML fixes you need to
              reach page one.
            </p>
          </div>

          {/* Right */}
          <div className="right">

            {/* Card */}
            <div className="card">

              {/* Tabs */}
              <div className="tabs">
                <button className={`tab-btn${isLogin?" active":""}`}
                  onClick={()=>setMode("login")}>Log In</button>
                <button className={`tab-btn${isSignup?" active":""}`}
                  onClick={()=>setMode("signup")}>Create Account</button>
              </div>

              <div className="card-body">

                {/* Header */}
                <div className="card-title" style={{fontFamily:"'Syne',sans-serif"}}>
                  {isLogin ? "Welcome Back" : "Create Your Account"}
                </div>
                <div className="card-sub">
                  {isLogin
                    ? "Enter your credentials to access your SEO dashboard."
                    : "Start your free account and run your first audit today."}
                </div>

                {/* OAuth */}
                <div className="oauth-row">
                  <button className="oauth-btn oauth-google">
                    <GoogleIcon/> Google
                  </button>
                  <button className="oauth-btn oauth-github">
                    <GithubIcon/> GitHub
                  </button>
                </div>

                {/* OR */}
                <div className="or-divider">
                  <div className="or-line"/>
                  <div className="or-txt">or</div>
                  <div className="or-line"/>
                </div>

                {/* Name row- signup only */}
                {isSignup && (
                  <div className="name-row">
                    <div className="field">
                      <div className="field-hdr">
                        <label className="field-label">First Name</label>
                      </div>
                      <div className="input-wrap">
                        <div className="input-icon"><UserIcon/></div>
                        <input className="field-input" type="text" placeholder="Ada"
                          value={first} onChange={e=>setFirst(e.target.value)}/>
                      </div>
                    </div>
                    <div className="field">
                      <div className="field-hdr">
                        <label className="field-label">Last Name</label>
                      </div>
                      <div className="input-wrap">
                        <div className="input-icon"><UserIcon/></div>
                        <input className="field-input" type="text" placeholder="Lovelace"
                          value={last} onChange={e=>setLast(e.target.value)}/>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="field">
                  <div className="field-hdr">
                    <label className="field-label">Email Address</label>
                  </div>
                  <div className="input-wrap">
                    <div className="input-icon"><MailIcon/></div>
                    <input className="field-input" type="email" placeholder="name@company.com"
                      value={email} onChange={e=>setEmail(e.target.value)}/>
                  </div>
                </div>

                {/* Password */}
                <div className="field">
                  <div className="field-hdr">
                    <label className="field-label">Password</label>
                    {isLogin && (
                      <button className="forgot-link">Forgot Password?</button>
                    )}
                  </div>
                  <div className="input-wrap">
                    <div className="input-icon"><LockIcon/></div>
                    <input className="field-input"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password} onChange={e=>setPassword(e.target.value)}/>
                    <button className="pw-toggle" onClick={()=>setShowPw(p=>!p)}>
                      {showPw ? <EyeOff/> : <EyeOpen/>}
                    </button>
                  </div>
                </div>

                {/* Terms- signup only */}
                {isSignup && (
                  <div className="terms-row">
                    <button className={`terms-box${agreed?" on":""}`}
                      onClick={()=>setAgreed(p=>!p)}>
                      {agreed && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                    <div className="terms-txt">
                      I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button className="submit-btn"
                  disabled={loading || (isSignup && !agreed)}
                  onClick={handleSubmit}>
                  {loading
                    ? <><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⚙</span>{isLogin?" Signing in…":" Creating account…"}</>
                    : <>{isLogin ? "Sign In to Dashboard" : "Create Free Account"}<ArrowRight/></>
                  }
                </button>

                {/* Legal */}
                <div className="legal">
                  {isLogin
                    ? <>By signing in, you agree to our <a>Terms of Service</a> and <a>Privacy policy</a></>
                    : <>By signing up, you agree to our <a>Terms of Service</a> and <a>Privacy policy</a></>
                  }
                </div>

              </div>
            </div>

            {/* Below card */}
            <div className="below-card">
              {isLogin
                ? <>Don't have an account yet?{" "}<a onClick={()=>setMode("signup")}>Start your 14-day free trial</a></>
                : <>Already have an account?{" "}<a onClick={()=>setMode("login")}>Sign in here</a></>
              }
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-txt">© 2026 SEO Insight Engine. Built for developers.</div>
        </footer>

      </div>
    </>
  );
}
