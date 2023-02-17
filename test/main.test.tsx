import { describe, it, expect } from "vitest";
import User from "../src/User";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

describe("something truthy and falsy", () => {
  it("true to be true", () => {
    expect(true).toBe(true);
  });

  it("false to be false", () => {
    expect(false).toBe(false);
  });
});

describe("App", () => {
  it("renders headline", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <User
          id={undefined}
          clearId={() => {
            return;
          }}
        />
      </QueryClientProvider>
    );

    screen.debug();

    // check if App components renders headline
  });
});
