export interface UserModel {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  note?: string;
}

export interface WithDetail {
  candidate: UserModel;
  detail: any;
}

const server = document.baseURI;

export const candidateById = async (id: number) => {
  const res = await fetch(new URL(`/api/candidate/${id}`, server));
  return res.json();
};

export const newCandidate = async (): Promise<WithDetail> => {
  const res = await fetch(new URL("/api/candidate/new", server));
  return res.json();
};

export const candidates = async (): Promise<{ items: UserModel[] }> => {
  const res = await fetch(new URL("/api/candidate", server));
  return res.json();
};

export const saveCandidate = async (
  candidate: UserModel
): Promise<UserModel> => {
  const res = await fetch(new URL("/api/candidate", server), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidate),
  });
  return res.json();
};
