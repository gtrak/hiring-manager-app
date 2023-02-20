import { describe, it, expect, vi } from "vitest";
import UserList from "../src/UserList";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  ContextOptions,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

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
