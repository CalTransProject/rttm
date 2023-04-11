import MOCK_DATA from "./Data/MOCK_DATA.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Styling/General.css";
const General = () => {
  //Function Purpose to display pop up page for camera details
  const handleRowClick = (event, rowData) => {
    // handle pop-up menu logic here
  };

  return (
    <div className="General">
      <h1>General</h1>
      <table className="table table-bordered">
        <thead>
          <th>Index</th>
          <th>Name</th>
          <th>Type</th>
          <th>Address</th>
          <th>Default</th>
        </thead>
        <tbody>
          {MOCK_DATA.map((d, i) => (
            <tr key={i}>
              <td>{d.Index}</td>
              <td>{d.Name}</td>
              <td>{d.Type}</td>
              <td>{d.Address}</td>
              <td>{d.Default}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default General;
