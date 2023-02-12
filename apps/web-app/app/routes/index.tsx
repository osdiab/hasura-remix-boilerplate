import { useLoaderData } from "@remix-run/react";
import { graphql } from "@uhr/gql-web/generated/gql";
import {
	AllUsersQuery,
	AllUsersQueryVariables,
} from "@uhr/gql-web/generated/graphql";
import { request } from "graphql-request";

const query = graphql(`
  query allUsers {
    auth_user {
      id
      email
    }
  }
`);

export async function loader() {
	return request<AllUsersQuery, AllUsersQueryVariables>(
		"http://localhost:8002/v1/graphql",
		query,
	);
}
export default function Index() {
	const data = useLoaderData<typeof loader>();
	return (
		<div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
			<h1>Welcome to Remix</h1>
			<ul>
				{data.auth_user.map((v) => (
					<li key={v.id}>{v.email}</li>
				))}
			</ul>
		</div>
	);
}
