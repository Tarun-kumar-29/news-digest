import { GraphQLClient } from 'graphql-request';
import nhost from './nhostConfig';

export const client = new GraphQLClient(`${nhost.graphql.url}`, {
  headers: async () => ({
    Authorization: `Bearer ${await nhost.auth.getJWT()}`,
  }),
});
