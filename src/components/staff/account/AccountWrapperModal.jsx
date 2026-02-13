const AccountWrapperModal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
    <div className="flex justify-center px-4 py-8">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-3xl text-white">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-red-500">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
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
        background: #111827;
        border: 1px solid #374151;
        padding: 8px 10px;
        border-radius: 6px;
      }
    `}</style>
  </div>
);

export default AccountWrapperModal;
