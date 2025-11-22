const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal" style={styles.modal}>
        <div className="modal-header" style={styles.header}>
          <h3>{title}</h3>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-content" style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '8px',
    width: 'min(800px,90%)',
    padding: '1rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  content: { fontSize: '0.95rem', lineHeight: 1.4 },
};

export default Modal;
