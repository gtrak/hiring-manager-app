import { UserModel } from "./api";

const users: UserModel[] = [
  {
    first_name: "Gary",
    last_name: "Trakhman",
    email: "gary.trakhman@gmail.com",
    phone: "4044571917",
    status: "Approved",
    note: "Great candidate",
  },
  {
    first_name: "first",
    last_name: "last",
    email: "test2@test.com",
    phone: "4044571917",
    status: "Approved",
  },
  {
    first_name: "first",
    last_name: "last",
    email: "test3@test.com",
    phone: "4044571917",
    status: "Approved",
  },
  {
    first_name: "first",
    last_name: "last",
    email: "test4@test.com",
    phone: "4044571917",
    status: "Approved",
  },
];

const UserList: React.FC = () => {
  const rows = users.map(
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
