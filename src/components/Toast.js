export default function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      background: '#2d5e3e', color: '#fff', padding: '9px 20px',
      borderRadius: 20, fontSize: 13, zIndex: 1000,
      whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      animation: 'fadeIn 0.2s ease'
    }}>
      {message}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-6px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } }`}</style>
    </div>
  )
}
