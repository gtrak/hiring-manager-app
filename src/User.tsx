import React from "react";

interface UserModel {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  note?: string;
}

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
    picture: candidate.picture.medium,
  };
};

/* TODO: check if any of these fields are optional */
const User: React.FC<UserInfo> = ({ name, contact, picture }) => {
  return (
    <div>
      <div>
        {name.first} {name.last}
      </div>
      <div>{contact.email}</div>
      <div>{contact.cell}</div>
      <img src={picture} alt="profile photo" />
    </div>
  );
};

export default User;
