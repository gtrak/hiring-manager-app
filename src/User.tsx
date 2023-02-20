import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateById, newCandidate, saveCandidate, WithDetail } from "./api";

export const mockResponse = {
  results: [
    {
      gender: "female",
      name: { title: "Ms", first: "Sima", last: "Beijersbergen" },
      location: {
        street: { number: 9374, name: "De Gardeniers" },
        city: "Baaium",
        state: "Zuid-Holland",
        country: "Netherlands",
        postcode: "9540 SB",
        coordinates: { latitude: "37.5056", longitude: "56.7883" },
        timezone: { offset: "-2:00", description: "Mid-Atlantic" },
      },
      email: "sima.beijersbergen@example.com",
      login: {
        uuid: "d0e6e50e-0fda-4368-9182-e8677139f882",
        username: "blackwolf556",
        password: "leeds",
        salt: "81QmxHJf",
        md5: "241f2a954995872a14d051935f7353bd",
        sha1: "b0b9c1a6063b786fc528d93449411affc7c2e27f",
        sha256:
          "7ee079303f3e5c711908afaf324e0d527652a60316bfcee141338661852f166b",
      },
      dob: { date: "1969-05-24T20:41:41.123Z", age: 53 },
      registered: { date: "2011-06-21T09:57:57.894Z", age: 11 },
      phone: "(002) 6955176",
      cell: "(06) 86865798",
      id: { name: "BSN", value: "83690635" },
      picture: {
        large: "https://randomuser.me/api/portraits/women/48.jpg",
        medium: "https://randomuser.me/api/portraits/med/women/48.jpg",
        thumbnail: "https://randomuser.me/api/portraits/thumb/women/48.jpg",
      },
      nat: "NL",
    },
  ] as const,
  info: { seed: "85f4508473763fc0", results: 1, page: 1, version: "1.4" },
} as const;

export const mockResult = mockResponse.results[0];

interface ContactInfo {
  /* TODO: replace placeholders */
  email: (typeof mockResult)["email"];
  phone: (typeof mockResult)["phone"];
  cell: (typeof mockResult)["cell"];
}

interface UserInfo {
  name: (typeof mockResult)["name"];
  contact: ContactInfo;
  picture: string;
}

export const responseInfo = (candidate: typeof mockResult): UserInfo => {
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
