// eslint-disable-next-line react/prop-types
const TopBar = ({ title }) => {
  return (
    <header className="bg-gray-200 p-4">
      <h1 className="text-3xl font-semibold text-gray-700">{ title }</h1>
    </header>
  );
};

export default TopBar;