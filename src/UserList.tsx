import { useQuery } from "react-query";
import { candidates } from "./api";

const rowStyles =
  " hover:bg-gray-100 dark:hover:bg-gray-700 border border-slate-300 ";
const UserList: React.FC<{ id?: number; setId: (id: number) => void }> = ({
  id,
  setId,
}) => {
  const { status, data, error } = useQuery("candidates", candidates);

  if (error) {
    console.error(error);
  }
  const rows =
    status !== "success"
      ? "Loading"
      : data!.items.map(
          ({
            id: rowId,
            first_name,
            last_name,
            note,
            email,
            phone,
            status,
          }) => {
            let bg = id == rowId && "bg-slate-300";
            if (!bg) {
              switch (status) {
                case "accepted":
                  bg = "bg-teal-100";
                  break;
                case "rejected":
                  bg = "bg-rose-100";
                  break;
              }
            }
            return (
              <tr
                key={"candidate_" + rowId}
                onClick={() => setId(rowId!)}
                className={rowStyles + bg}
              >
                <td className="px-6 py-4 whitespace-nowrap  text-gray-800 dark:text-gray-200">
                  {first_name} {last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap  text-gray-800 dark:text-gray-200 hidden md:table-cell">
                  {email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap  text-gray-800 dark:text-gray-200 hidden md:table-cell">
                  {phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap  text-gray-800 dark:text-gray-200">
                  {note}
                </td>
              </tr>
            );
          }
        );
  return (
    <div className="max-w rounded overflow-scroll shadow-lg">
      <table className="table-fixed min-w-full divide-y divide-gray-200 dark:divide-gray-700  my-4">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left w-[200px] text-slate-700">
              Name
            </th>
            <th className="px-6 py-3 text-left w-[200px] text-slate-700 hidden md:table-cell">
              Email
            </th>
            <th className="px-6 py-3 text-left w-[200px] text-slate-700 hidden md:table-cell">
              Phone
            </th>
            <th className="px-6 py-3 text-left w-[200px] text-slate-700">
              Note
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

export default UserList;
