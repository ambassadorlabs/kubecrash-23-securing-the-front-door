import * as k8s from '@pulumi/kubernetes'
import * as certmanager from '../crds/certmanager'
import * as cluster from '../cluster'
import config from '../config'

const namespace = new k8s.core.v1.Namespace('cert-manager', {
  metadata: {
    name: 'cert-manager',
  }
}, { provider: cluster.provider })

// The cert-manager chart does not install its own crds so we are installing them ourselves
export const crds = new k8s.yaml.ConfigFile('cert-manager-crds', {
  file: './certmanager/cert-manager.crds.yaml',
}, { provider: cluster.provider })

export const release = new k8s.helm.v3.Release('cert-manager', {
  chart: 'cert-manager',
  version: '1.11.0',
  namespace: namespace.metadata.name,
  repositoryOpts: {
    repo: 'https://charts.jetstack.io'
  },
}, { provider: cluster.provider, dependsOn: crds })

const cloudflareSecret = new k8s.core.v1.Secret('cert-manager-cloudflare', {
  metadata: {
    name: 'cloudflare-api-token-secret',
    namespace: namespace.metadata.name,
  },
  stringData: {
    'api-token': config.requireSecret('cloudflareApiToken'),
  }
}, { provider: cluster.provider })

export const stagingClusterIssuer = new certmanager.certmanager.v1.ClusterIssuer('staging-cluster-issuer', {
  metadata: {
    name: 'letsencrypt-staging',
    namespace: namespace.metadata.name
  },
  spec: {
    acme: {
      email: config.requireSecret('acmeEmail'),
      server: 'https://acme-staging-v02.api.letsencrypt.org/directory',
      privateKeySecretRef: {
        name: 'staging-issuer-account-key'
      },
      solvers: [
        {
          dns01: {
            cloudflare: {
              apiTokenSecretRef: {
                name: cloudflareSecret.metadata.name,
                key: 'apiKey'
              }
            }
          }
        }
      ]
    },
  }
}, {provider: cluster.provider, dependsOn: release })

 export const productionClusterIssuer = new certmanager.certmanager.v1.ClusterIssuer('production-cluster-issuer', {
   metadata: {
     name: 'letsencrypt-production',
     namespace: namespace.metadata.name
   },
   spec: {
     acme: {
       email: config.requireSecret('acmeEmail'),
       server: 'https://acme-v02.api.letsencrypt.org/directory',
       privateKeySecretRef: {
         name: 'production-issuer-account-key'
       },
       solvers: [
         {
           dns01: {
             cloudflare: {
               apiTokenSecretRef: {
                 name: cloudflareSecret.metadata.name,
                 key: 'apiKey'
               }
             }
           }
         }
       ]
     }
   }
 }, {provider: cluster.provider, dependsOn: release })
