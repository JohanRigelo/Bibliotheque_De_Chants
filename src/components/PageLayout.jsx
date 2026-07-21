function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f0f4ff] dark:bg-slate-900 p-5">
      {children}
    </div>
  );
}

export default PageLayout;
