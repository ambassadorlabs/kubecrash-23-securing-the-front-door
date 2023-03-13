# Securing the Front Door
## Configuring TLS in Emissary-Ingress with cert-manager

A [KubeCrash](https://www.kubecrash.io/) presentation

Associated slides can be found [here](https://docs.google.com/presentation/d/1FmvrzO09nsS8UR2KmlXa1l9dISTLiRHDbwGxK4RY_KQ/edit?usp=sharing).

Learn more about [Emissary-Ingress](https://www.getambassador.io/products/api-gateway) and [cert-manager](https://www.cert-manager.io)

## Using this repository

### Installing and configuring tools

This repository uses Pulumi and Node/NPM for Infrastructure-as-Code. To get started you'll need to:
1. [Install Pulumi](https://www.pulumi.com/docs/get-started/install/)
2. [Install NVM](https://github.com/nvm-sh/nvm). There are other ways to get Node/NPM on your machine but I recommend this one as an easy way to get started.
3. Once you have those tools installed, run `$ cd iac && npm install` to install the necessary packages.
4. Run `$ cd iac && pulumi login --local` to create a local Pulumi config storage profile.

Now you'll need to do a bit of customization to get DNS configuration working correctly. I use Cloudflare in this repository to manage DNS. Your steps depend on if you do as well.

#### If you use Cloudflare
1. Get your [API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) and [Zone ID](https://developers.cloudflare.com/fundamentals/get-started/basic-tasks/find-account-and-zone-ids/) from Cloudflare.
2. Go to the `iac/` directory
3. Run `$ pulumi login --local`
4. Run `$ pulumi config set --secret cloudflare:apiToken '<yourtoken>'`
5. Run `$ pulumi config set --secret cloudflareApiToken '<yourtoken>'`
6. Run `$ pulumi config set --secret cloudflareZoneId '<yourzoneid>'`
7. Run `$ pulumi config set --secret acmeEmail '<youremail>'`

#### If you don't use Cloudflare
cert-manager provides many different [DNS resolver options](https://cert-manager.io/docs/configuration/acme/dns01/).

1. See if your DNS services is available as an option from cert-manager
2. Look in the [Pulumi docs](https://www.pulumi.com/registry/) for the provider for your service, like [Route53](https://www.pulumi.com/registry/packages/aws/api-docs/route53/) or [DigitalOcean](https://www.pulumi.com/registry/packages/digitalocean/)
3. For whatever secret key is required for your provider, follow the doc instructions to set it, i.e. `$ pulumi config set --secret digitalocean:token '<yourtoken>'`
4. In the [emojivoto config file](./iac/emojivoto/index.ts) replace the exported `dns` const with the correct code for your provider.
5. In the [cert-manager config file](./iac/certmanager/index.ts) replace the solver in the `stagingClusterIssuer` and `productionClusterIssuer` with your solver configuration.

#### Customize your domain
In the [consts file](./iac/consts.ts) change the `domain` and `tld` variables to change the interpolated text in other places from `emojivoto.thedevelopnik.com` to your domain.

#### Point to your Kubernetes cluster configuration
In the [cluster configuration file](./iac/cluster/index.ts) change the properties to point to your `.kube/config` file or appropriate standalone config file to point at your test cluster.

### Setting up the cluster

Now cd into the `iac/` directory and run `$ pulumi up`. You will get a question to confirm if you want to apply the changes, stop, or check the changes before applying.
The first run will initiate a lot of changes, as it will install
* Emissary-Ingress
* cert-manager
* [Emojivoto sample application](https://github.com/BuoyantIO/emojivoto)
* Create a TLS certificate using Let's Encrypt's staging server.

Next, double check that your certificate configuration is correct by running `$ kubectl get certificate -n emojivoto emojivoto-staging`. It can take up to 90 seconds or so
for the certificate to finish procurement. If it does not, or if there is an error, you can check the logs of the cert-manager pod in the cert-manager namespace for more information.

**It is absolutely critical that you attempt to get a staging certificate before doing a production one, as it's easy to burn through
the Let's Encrypt production server rate limit and be unable to continue.**

### Securely routing traffic with Emissary-Ingress

The rest of our work will be in the [emojivoto file](./iac/emojivoto/index.ts) and all commands will be run in the `iac/` directory.

#### DNS
Uncomment the `dns` code block, run `$ pulumi up` and confirm the prompt to create a DNS entry pointing at your cluster.

#### Host
Uncomment the `host` code block, run `$ pulumi up` and confirm the prompt to create an Emissary-Ingress `Host` resource.
Hosts tell Emissary-Ingress what domains to accept traffic from, and how to handle requests coming from that domain.
Note that in the `requestPolicy` block, we tell it to `Route` insecure requests. We don't have a certificate set up yet, but we want to check connectivity.

Emissary-Ingress is now listening on that domain, but if you go to your emojivoto DNS entry (http://emojivoto.yourdomain.tld) you won't reach emojivoto, because
we haven't configured Emissary to route traffic yet.

#### Mapping
Uncomment the `mapping` code block, run `$ pulumi up` and confirm the prompt to create a `Mapping` resource. Mappings are how we configure Emissary to route and handle traffic.
This mapping is very basic, but [Mappings](https://www.getambassador.io/docs/emissary/latest/howtos/route) have very adaptable routing configurations, and can also customize do advanced load balancing, timeouts, retries and more.

Mappings are the core of Emissary-Ingress' decentralized workflow. A platform team can handle DNS, Hosts and TLS configuration, and then dev teams can deploy mappings with their app,
for example as part of a Helm chart, and instantly create or update routes as they need without waiting on the platform/ops team.

#### Testing the connection and making it secure
Now that we have a DNS entry, a Host and a Mapping, you can open a browser and visit http://emojivoto.yourdomain.tld and see the app running and accessible.

But we don't want an insecure connection, the whole point is to secure our cluster at the edge! To fix this, we need to create a certificate using cert-manager, and tell Emissary to use it.

First, uncomment the `productionCertificate` code block, run `$ pulumi up` and confirm the prompt. Now just as you did before with the staging certificate, check that it successfully provisions.
The resulting certificate info is stored in a Kubernetes secret following the pattern `${emojivoto}-${domain}-${tld}`.

Now that we have a certificate, we want to update our Host. Copy the commented-out `secure host spec config` code block from below the Host config, and paste it into the Host,
replacing the current `spec`. There are two major changes here.
1. We add a new `tlsSecret` property, that points at the secret created by cert-manager holding our new TLS certificate.
2. We change our `requestPolicy` property to `Redirect` all insecure requests instead of routing them forward. Now no insecure requests can come into our cluster.

With Emissary as the only entrypoint, any traffic not controlled by a Host being rejected, and the Host redirecting all insecure requests, our cluster is secured at the edge!
The platform/ops team has now created a secure ingress that devs don't need to worry about, and they can create/update traffic routing without breaking the secure setup. 
