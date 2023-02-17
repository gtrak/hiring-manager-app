import { useQuery } from "react-query";
import { UserModel, candidates } from "./api";

const users: UserModel[] = [];

const UserList: React.FC = () => {
  const { status, data, error, isFetching } = useQuery(
    "candidates",
    candidates
  );

  if (error) {
    console.error(error);
  }
  const rows =
    status !== "success"
      ? "Loading"
      : data!.items.map(
          ({ id, first_name, last_name, email, phone, status, note }) => {
            return (
              <tr key={id || email}>
                <td>
                  {first_name} {last_name}
                </td>
                <td>{email}</td>
                <td>{phone}</td>
                <td>{status}</td>
                <td>{note}</td>
              </tr>
            );
          }
        );
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <table className="table-auto">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

export default UserList;
