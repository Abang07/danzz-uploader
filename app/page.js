'use client';
import { useState, useRef } from 'react';

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  async function uploadFile(file) {
    setUploading(true);
    setError('');
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    const interval = setInterval(() => setProgress(p => Math.min(p + 8, 90)), 200);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setProgress(0), 800);
      if (data.url) setResults(prev => [{ ...data, id: Date.now() }, ...prev]);
      else setError(data.error || 'Upload gagal');
    } catch {
      clearInterval(interval);
      setError('Koneksi bermasalah, coba lagi');
    }
    setUploading(false);
  }

  function handleChange(e) { if (e.target.files[0]) uploadFile(e.target.files[0]); }
  function handleDrop(e) { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]); }
  function fmt(b) { return b < 1048576 ? (b/1024).toFixed(1)+' KB' : (b/1048576).toFixed(1)+' MB'; }
  function icon(n) {
    const e = n.split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif','webp','svg'].includes(e)) return '🖼️';
    if (['mp4','mov','avi','mkv','webm'].includes(e)) return '🎬';
    if (['mp3','wav','ogg','flac'].includes(e)) return '🎵';
    if (['pdf'].includes(e)) return '📄';
    if (['zip','rar','7z'].includes(e)) return '🗜️';
    if (['doc','docx'].includes(e)) return '📝';
    if (['xls','xlsx'].includes(e)) return '📊';
    return '📁';
  }

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a0a0f 0%,#0f0a1a 50%,#0a0f1a 100%)',color:'#fff',fontFamily:"'Segoe UI',system-ui,sans-serif",padding:'16px',boxSizing:'border-box'}}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .upload-btn:hover { transform:translateY(-1px); box-shadow:0 8px 25px rgba(139,92,246,0.4) !important; }
        .file-card:hover { border-color:#4c1d95 !important; background:#1a1025 !important; }
        .copy-btn:hover { background:#4c1d95 !important; }
      `}</style>

      <div style={{maxWidth:'580px',margin:'0 auto'}}>

        {/* Logo */}
        <div style={{textAlign:'center',padding:'36px 0 28px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
            <div style={{width:'40px',height:'40px',background:'linear-gradient(135deg,#7c3aed,#2563eb)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',boxShadow:'0 4px 20px rgba(124,58,237,0.4)'}}>⚡</div>
            <span style={{fontSize:'26px',fontWeight:'800',background:'linear-gradient(90deg,#a78bfa,#60a5fa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:'-0.5px'}}>Danzz Uploader</span>
          </div>
          <p style={{color:'#6b7280',margin:0,fontSize:'14px'}}>Upload cepat • Simpan aman • Akses kapan saja</p>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => !uploading && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: dragging ? '2px solid #7c3aed' : '2px dashed #2d2040',
            borderRadius: '20px',
            padding: '44px 24px',
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: dragging ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.25s ease',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
          }}>

          {/* Progress bar */}
          {progress > 0 && (
            <div style={{position:'absolute',top:0,left:0,height:'3px',width:progress+'%',background:'linear-gradient(90deg,#7c3aed,#2563eb)',transition:'width 0.2s ease',borderRadius:'3px'}}/>
          )}

          <div style={{fontSize:'40px',marginBottom:'14px',animation: uploading ? 'pulse 1.5s infinite' : 'none'}}>
            {uploading ? '⚡' : dragging ? '🎯' : '☁️'}
          </div>

          {uploading ? (
            <>
              <p style={{fontSize:'16px',fontWeight:'700',margin:'0 0 6px',color:'#a78bfa'}}>Mengupload file...</p>
              <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>{progress}% selesai</p>
            </>
          ) : (
            <>
              <p style={{fontSize:'16px',fontWeight:'700',margin:'0 0 6px'}}>
                {dragging ? 'Lepaskan file di sini!' : 'Drag & drop file kamu'}
              </p>
              <p style={{color:'#6b7280',fontSize:'13px',margin:'0 0 20px'}}>atau klik untuk pilih dari galeri/storage</p>
              <div className="upload-btn" style={{display:'inline-block',background:'linear-gradient(135deg,#7c3aed,#2563eb)',padding:'10px 28px',borderRadius:'50px',fontSize:'14px',fontWeight:'600',transition:'all 0.2s',boxShadow:'0 4px 15px rgba(124,58,237,0.3)'}}>
                Pilih File
              </div>
            </>
          )}

          <input ref={inputRef} type="file" onChange={handleChange} disabled={uploading} style={{display:'none'}}/>
        </div>

        {/* Info chips */}
        <div style={{display:'flex',gap:'8px',justifyContent:'center',marginBottom:'20px',flexWrap:'wrap'}}>
          {['🖼️ Gambar','🎬 Video','🎵 Audio','📄 PDF','🗜️ ZIP'].map(t => (
            <span key={t} style={{background:'rgba(255,255,255,0.04)',border:'1px solid #2a2040',padding:'4px 12px',borderRadius:'50px',fontSize:'12px',color:'#9ca3af'}}>{t}</span>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'12px',padding:'12px 16px',marginBottom:'16px',color:'#f87171',fontSize:'14px',animation:'fadeIn 0.3s ease'}}>
            ❌ {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
              <p style={{color:'#9ca3af',fontSize:'13px',margin:0}}>✅ Terupload ({results.length} file)</p>
              <button onClick={() => setResults([])} style={{background:'none',border:'none',color:'#6b7280',fontSize:'12px',cursor:'pointer'}}>Hapus semua</button>
            </div>

            {results.map((r) => (
              <div className="file-card" key={r.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid #2a2040',borderRadius:'14px',padding:'14px',marginBottom:'10px',display:'flex',alignItems:'center',gap:'12px',transition:'all 0.2s',animation:'fadeIn 0.3s ease'}}>
                <div style={{width:'44px',height:'44px',background:'rgba(124,58,237,0.15)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>
                  {icon(r.name)}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:'0 0 3px',fontWeight:'600',fontSize:'14px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.name}</p>
                  <p style={{margin:0,color:'#6b7280',fontSize:'12px'}}>{fmt(r.size)} • Tersimpan di cloud</p>
                </div>
                <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(r.url)} style={{background:'rgba(124,58,237,0.2)',border:'none',color:'#a78bfa',padding:'7px 10px',borderRadius:'8px',fontSize:'12px',cursor:'pointer',transition:'all 0.2s'}}>
                    📋
                  </button>
                  <a href={r.url} target="_blank" style={{background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'white',padding:'7px 14px',borderRadius:'8px',fontSize:'13px',textDecoration:'none',fontWeight:'600'}}>
                    Buka ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <p style={{textAlign:'center',color:'#374151',fontSize:'12px',marginTop:'32px',paddingBottom:'16px'}}>
          ⚡ Danzz Uploader — Powered by Vercel Blob
        </p>
      </div>
    </main>
  );
}
