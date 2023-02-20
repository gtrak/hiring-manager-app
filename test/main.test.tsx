import { describe, it, expect, vi } from "vitest";
import UserList from "../src/UserList";
import User from "../src/User";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import {
  ContextOptions,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { saveCandidate, UserModel } from "../src/api";

const testQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        enabled: false,
      },
    },
  });

/* helper for mocking react-query */
export function renderWithClient(
  client: QueryClient,
  ui: React.ReactElement,
  options: ContextOptions = {}
): ReturnType<typeof render> {
  const { rerender, ...result } = render(
    <QueryClientProvider client={client} context={options.context}>
      {ui}
    </QueryClientProvider>
  );
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(
        <QueryClientProvider client={client} context={options.context}>
          {rerenderUi}
        </QueryClientProvider>
      ),
  } as any;
}

const saved: { input: UserModel; output: UserModel }[] = [];

vi.mock("../src/api", async (importOriginal) => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    candidates: () => {
      return {
        items: [
          {
            id: 28,
            first_name: "Holly",
            last_name: "Hopkins",
            email: "holly.hopkins@example.com",
            phone: "06-9358-7114",
            status: "accepted",
            note: "bad at typing",
            seed: "285faef55792df37",
          },
          {
            id: 1,
            first_name: "Scarlett",
            last_name: "Walker",
            email: "scarlett.walker@example.com",
            phone: "05-5932-0851",
            status: "accepted",
            note: null,
            seed: "65044a9ad4235f01",
          },
        ],
      };
    },
    newCandidate: () => {
      return {
        candidate: {
          first_name: "Jeff",
          last_name: "Hudson",
          email: "jeffnew.hudson@example.com",
          phone: "031-933-0120",
          status: "New",
          seed: "9f6fdcd547e5409b",
        },
        detail: {
          gender: "male",
          name: { title: "Mr", first: "Jeff", last: "Hudson" },
          location: {
            street: { number: 8302, name: "The Drive" },
            city: "Buncrana",
            state: "Kildare",
            country: "Ireland",
            postcode: 77652,
            coordinates: { latitude: "-1.8541", longitude: "-25.8751" },
            timezone: {
              offset: "-7:00",
              description: "Mountain Time (US & Canada)",
            },
          },
          email: "jeffnew.hudson@example.com",
          login: {
            uuid: "772dd26c-a333-4e8a-94ae-e8e85f660230",
            username: "purpletiger893",
            password: "drizzt",
            salt: "Qpll5GOg",
            md5: "5b4e23eb726dd992c588050ba194b5ee",
            sha1: "ced008a5c90a51796139176a09d114a99a26bedd",
            sha256:
              "cbb155cc32527b3ed66f10cd87da394183fdeba6561129002b4d9d21e9e483cf",
          },
          dob: { date: "1974-03-19T09:38:10.791Z", age: 48 },
          registered: { date: "2021-01-28T01:42:48.928Z", age: 2 },
          phone: "031-933-0120",
          cell: "081-455-8613",
          id: { name: "PPS", value: "6678007T" },
          picture: {
            large: "https://randomuser.me/api/portraits/men/50.jpg",
            medium: "https://randomuser.me/api/portraits/med/men/50.jpg",
            thumbnail: "https://randomuser.me/api/portraits/thumb/men/50.jpg",
          },
          nat: "IE",
        },
      };
    },
    candidateById: (id: number) => {
      expect(id).toEqual(5);
      return {
        candidate: {
          first_name: "Jeff",
          last_name: "Hudson",
          email: "jeffbyid.hudson@example.com",
          phone: "031-933-0120",
          status: "New",
          seed: "9f6fdcd547e5409b",
        },
        detail: {
          gender: "male",
          name: { title: "Mr", first: "Jeff", last: "Hudson" },
          location: {
            street: { number: 8302, name: "The Drive" },
            city: "Buncrana",
            state: "Kildare",
            country: "Ireland",
            postcode: 77652,
            coordinates: { latitude: "-1.8541", longitude: "-25.8751" },
            timezone: {
              offset: "-7:00",
              description: "Mountain Time (US & Canada)",
            },
          },
          email: "jeffbyid.hudson@example.com",
          login: {
            uuid: "772dd26c-a333-4e8a-94ae-e8e85f660230",
            username: "purpletiger893",
            password: "drizzt",
            salt: "Qpll5GOg",
            md5: "5b4e23eb726dd992c588050ba194b5ee",
            sha1: "ced008a5c90a51796139176a09d114a99a26bedd",
            sha256:
              "cbb155cc32527b3ed66f10cd87da394183fdeba6561129002b4d9d21e9e483cf",
          },
          dob: { date: "1974-03-19T09:38:10.791Z", age: 48 },
          registered: { date: "2021-01-28T01:42:48.928Z", age: 2 },
          phone: "031-933-0120",
          cell: "081-455-8613",
          id: { name: "PPS", value: "6678007T" },
          picture: {
            large: "https://randomuser.me/api/portraits/men/50.jpg",
            medium: "https://randomuser.me/api/portraits/med/men/50.jpg",
            thumbnail: "https://randomuser.me/api/portraits/thumb/men/50.jpg",
          },
          nat: "IE",
        },
      };
    },
    saveCandidate: (candidate: UserModel) => {
      expect(candidate).toEqual({
        email: "jeffbyid.hudson@example.com",
        first_name: "Jeff",
        last_name: "Hudson",
        note: "My special note",
        phone: "031-933-0120",
        seed: "9f6fdcd547e5409b",
        status: "accepted",
      });
      const output = { ...candidate, id: 0 };
      saved.push({ input: candidate, output });
      return Promise.resolve(output);
    },
  };
});

describe("UserList", () => {
  it("renders the user list and reacts appropriately", async () => {
    const client = testQueryClient();
    const clicked: number[] = [];
    const mockSetId = (id: number) => {
      /* Ensure the clicked id is passed in */
      clicked.push(id);
      return;
    };

    const { rerender, ...result } = renderWithClient(
      client,
      <UserList id={undefined} setId={mockSetId} />
    );
    expect(await screen.findByText(/Loading/)).toBeInTheDocument();
    expect(screen.queryByText(/Holly/)).not.toBeInTheDocument();
    expect(clicked).toEqual([]);

    // Issue the query
    client.fetchQuery(["candidates"]);
    const holly = await screen.findByText(/Holly/);
    expect(holly).toBeInTheDocument();
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    expect(holly.closest("tr")?.getAttribute("data-active")).equal("false");

    holly.click();
    expect(clicked).toEqual([28]);

    /* Ensure selected state has changed */
    rerender(<UserList id={28} setId={mockSetId} />);
    expect(holly.closest("tr")?.getAttribute("data-active")).equal("true");
  });
});

describe("User", () => {
  it("renders the User details and reacts to state changes", async () => {
    const client = testQueryClient();

    let cleared = 0;
    let { rerender } = renderWithClient(
      client,
      <User
        id={undefined}
        clearId={() => {
          cleared++;
          return;
        }}
      />
    );
    expect(
      await screen.findByText(/jeffnew.hudson@example.com/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Holly/)).not.toBeInTheDocument();
    expect(cleared).toEqual(0);

    // Force an ID
    rerender(
      <User
        id={5}
        clearId={() => {
          cleared++;
          return;
        }}
      />
    );
    expect(
      await screen.findByText(/jeffbyid.hudson@example.com/)
    ).toBeInTheDocument();
    const note = screen.getByRole("textbox");
    expect(note.getAttribute("placeholder")).toEqual("Add an optional note");
    fireEvent.change(note, { target: { value: "My special note" } });
    expect(note.getAttribute("value")).toEqual("My special note");
    fireEvent.click(screen.getByText(/Accept/));
    expect(saved[0].output.id).toBe(0);
    expect(saved[0].output.note).toBe("My special note");
    expect(cleared).toEqual(0);
    await waitFor(() => {
      expect(cleared).toEqual(1);
    });
  });
});
