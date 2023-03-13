import * as k8s from '@pulumi/kubernetes'
import * as cloudflare from '@pulumi/cloudflare'
import * as cluster from '../cluster'
import * as emissaryCRDs from '../crds/emissary/getambassador/index'
import * as certmanagerCRDs from '../crds/certmanager/certmanager/index'
import config from '../config'
import * as certmanager from '../certmanager'
import * as emissary from '../emissary'
import {emojivoto, domain, tld } from '../consts'

export const install = new k8s.kustomize.Directory('emojivoto', {
  directory: 'https://github.com/BuoyantIO/emojivoto/tree/main/kustomize/deployment'
}, { provider: cluster.provider })

// used for testing cert-manager issuer configuration before we mess it up and
// go through the rate limit on the production server
export const stagingCertificate = new certmanagerCRDs.v1.Certificate('emojivoto-certificate-staging', {
  metadata: {
    name: `${emojivoto}-staging`,
    namespace: emojivoto,
  },
  spec: {
    secretName: `${emojivoto}-${domain}-${tld}-staging`,
    duration: '2160h',
    renewBefore: '360h',
    dnsNames: [`${emojivoto}.${domain}.${tld}`],
    issuerRef: {
      name: 'letsencrypt-staging',
      kind: 'ClusterIssuer',
    }
  }
}, { provider: cluster.provider, dependsOn: certmanager.stagingClusterIssuer })

//export const productionCertificate = new certmanagerCRDs.v1.Certificate('emojivoto-certificate-production', {
//  metadata: {
//    name: `${emojivoto}-staging`,
//    namespace: emojivoto,
//  },
//  spec: {
//    secretName: `${emojivoto}-${domain}-${tld}-staging`,
//    duration: '2160h',
//    renewBefore: '360h',
//    dnsNames: [`${emojivoto}.${domain}.${tld}`],
//    issuerRef: {
//      name: 'letsencrypt-production',
//      kind: 'ClusterIssuer',
//    }
//  }
//}, { provider: cluster.provider, dependsOn: certmanager.productionClusterIssuer })

//export const dns = new cloudflare.Record('emojivoto-thedevelopnik-com', {
//  name: 'emojivoto',
//  zoneId: config.requireSecret('cloudflareZoneId'),
//  type: 'A',
//  value: emissary.externalIP,
//})

//export const host = new emissaryCRDs.v3alpha1.Host('emojivoto-host', {
//  metadata: {
//    name: 'emojivoto',
//    namespace: namespace,
//  },
//  spec: {
//    hostname: `${emojivoto}.${domain}.${tld}`,
//    requestPolicy: {
//      insecure: {
//        action: 'Route',
//      }
//    }
//  }
//}, { provider: cluster.provider, dependsOn: [emissary.release, dns ] })

// secure host spec config
//  spec: {
//    hostname: `${emojivoto}.${domain}.${tld}`,
//    tlsSecret: {
//      name: `${emojivoto}-${domain}-${tld}`
//    },
//    requestPolicy: {
//      insecure: {
//        action: 'Redirect',
//      }
//    }
//  }

//export const mapping = new emissaryCRDs.v3alpha1.Mapping('emojivoto-mapping', {
//  metadata: {
//    name: 'emojivoto-web',
//    namespace: namespace,
//  },
//  spec: {
//    host: `${emojivoto}.${domain}.${tld}`,
//    prefix: '/',
//    service: 'web-svc.emojivoto:80'
//  }
//}, {provider: cluster.provider, dependsOn: [ emissary.release, install, host ] })
