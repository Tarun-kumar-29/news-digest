import { NhostClient } from '@nhost/nhost-js';

const nhost = new NhostClient({
  subdomain: 'ebxpsrrwyepwujbtggch', // Replace with your subdomain from Nhost
  region: 'ap-southeast-1', // Example: 'eu-central-1'
});

export default nhost;
