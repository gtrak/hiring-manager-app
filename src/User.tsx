import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateById, newCandidate, saveCandidate, WithDetail } from "./api";
import * as RandomUser from "./randomuser";

type ContactInfo = Pick<RandomUser.Result, "email" | "phone" | "cell">;

type UserInfo = Pick<RandomUser.Result, "name"> & {
  contact: ContactInfo;
  picture: string;
};

export const responseInfo = (candidate: RandomUser.Result): UserInfo => {
  return {
    name: candidate.name,
    contact: {
      email: candidate.email,
      phone: candidate.phone,
      cell: candidate.cell,
    },
    picture: candidate.picture.large,
  };
};

const Chip: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
      {children}
    </span>
  );
};

/* TODO: check if any of these fields are optional */
const UserInfo: React.FC<WithDetail & { onSave: () => void }> = ({
  candidate,
  detail,
  onSave,
}) => {
  const queryClient = useQueryClient();
  const { name, contact, picture } = responseInfo(detail);
  const [note, setNote] = useState<string>("");

  /* Sync up existing candidate note */
  useEffect(() => {
    /* Undefined value doesn't update the input component */
    setNote(candidate.note || "");
  }, [candidate]);

  const save = (status: "accepted" | "rejected") => {
    return saveCandidate({ ...candidate, status, note }).then(() => {
      setNote("");
      return queryClient.invalidateQueries(["candidates"]).then(onSave);
    });
  };

  return (
    /* This is just a modified tailwind card example */
    <div className="w-[400px] rounded overflow-hidden shadow-lg">
      <div className="pt-4">
        <div className="flex">
          <button
            className="bg-teal-500 hover:bg-blue-700 text-white font-bold py-2 px-4 flex-grow"
            onClick={() => save("accepted")}
          >
            Accept
          </button>
          <button
            className="bg-rose-500 hover:bg-red-700 text-white font-bold py-2 px-4 flex-grow"
            onClick={() => save("rejected")}
          >
            Reject
          </button>
        </div>
        <div className="flex">
          <input
            className="flex-grow bg-gray-100 border-2 m-2 rounded py-2 px-2"
            type="text"
            placeholder="Add an optional note"
            value={note}
            onChange={(evt) => setNote(evt.target.value)}
          />
        </div>
      </div>
      <img
        className="w-64 mx-auto"
        src={picture}
        alt="Sunset in the mountains"
      />
      <div className="px-6 pt-4 pb-2">
        <Chip>
          {name.first} {name.last}
        </Chip>
        <Chip>cell: {contact.cell}</Chip>
        <Chip>phone: {contact.phone}</Chip>
        <Chip>email: {contact.email}</Chip>
      </div>
    </div>
  );
};

const User: React.FC<{ id: number | undefined; clearId: () => void }> = ({
  id,
  clearId,
}) => {
  const queryClient = useQueryClient();
  const [forceReload, setForceReload] = useState<number>(0);
  const { status, data, error, refetch } = useQuery({
    queryKey: ["candidate", id],
    queryFn: ({ queryKey }) => {
      const [_, id] = queryKey;
      if (id) {
        return candidateById(id as number);
      } else {
        return newCandidate();
      }
    },
    /* Don't automatically reload, since the URL is the same for multiple candidates */
    enabled: false,
  });
  if (error) {
    console.error(error);
  }
  /* Handles initial load and getting new candidates */
  useEffect(() => {
    refetch();
  }, [forceReload]);

  /* Handles id prop change from selections */
  const prevId = useRef<number>();
  useEffect(() => {
    if (prevId.current !== id) {
      prevId.current = id!;
      refetch();
    }
  }, [id]);

  return status !== "success" ? (
    /* Hardcoded a size to prevent loading flash */
    <div className="w-[400px] h-[504px]">Loading</div>
  ) : (
    <div>
      <UserInfo
        onSave={() => {
          if (id) {
            /* Prevent flashing when it reuses state from an undefined ID */
            queryClient.removeQueries({
              queryKey: ["candidate", undefined],
            });
            clearId();
          } else {
            setForceReload(forceReload + 1);
          }
        }}
        {...data!}
      />
    </div>
  );
};

export default User;
