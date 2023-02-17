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

const server = (() => {
  const url = new URL(import.meta.env.BASE_URL);
  url.port = import.meta.env.HIRING_MANAGER_APP_SERVER_PORT;
  return url.toString();
})();

export const candidateByID = async (id: number) => {
  const res = await fetch(`${server}/candidate/${id}`);
  return res.json();
};

export const newCandidate = async () => {
  const res = await fetch(`${server}/candidate/new`);
  return res.json();
};

export const candidates = async (): Promise<UserModel[]> => {
  const res = await fetch(`${server}/candidate`);
  return res.json();
};

export const saveCandidate = async (
  candidate: UserModel
): Promise<UserModel> => {
  const res = await fetch(`${server}/candidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidate),
  });
  return res.json();
};
