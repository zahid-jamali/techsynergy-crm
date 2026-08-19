const Loading = () => {
  return (
    <>
      <style>{`
          .loader {
            width: 48px;
            height: 48px;
            border: 3px solid #e5e7eb;
            border-top-color: #021d54;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

      <span className="loader" aria-label="Loading" />
    </>
  );
};

export default Loading;
