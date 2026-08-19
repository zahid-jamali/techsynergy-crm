const AccountWrapperModal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-heading/40 backdrop-blur-sm overflow-y-auto">
    <div className="flex justify-center px-4 py-8">
      <div className="bg-card border border-gray-200 rounded-lg w-full max-w-3xl text-heading">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-brand">{title}</h2>
          <button
            onClick={onClose}
            className="text-bodyText hover:text-heading text-xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>

    <style jsx>{`
      .input {
        width: 100%;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        padding: 8px 10px;
        border-radius: 6px;
      }
    `}</style>
  </div>
);

export default AccountWrapperModal;
