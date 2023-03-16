import * as k8s from '@pulumi/kubernetes'
import * as cloudflare from '@pulumi/cloudflare'
import * as cluster from '../cluster'
import * as certmanager from '../certmanager'
import * as emissary from '../emissary'
import * as emissaryCRDs from '../crds/emissary/getambassador/index'
import * as certmanagerCRDs from '../crds/certmanager/certmanager/index'
import {faces, domain, tld } from '../consts'
import config from '../config'

const namespace = new k8s.core.v1.Namespace('faces', {
  metadata: {
    name: 'faces',
  }
}, { provider: cluster.provider })

export const configFile = new k8s.yaml.ConfigFile('faces-app', {
  file: './faces/configfile/faces.yaml'
}, { provider: cluster.provider, dependsOn: namespace })

// used for testing cert-manager issuer configuration before we mess it up and
// go through the rate limit on the production server
export const stagingCertificate = new certmanagerCRDs.v1.Certificate('faces-certificate-staging', {
  metadata: {
    name: `${faces}-staging`,
    namespace: faces,
  },
  spec: {
    secretName: `${faces}-${domain}-${tld}-staging`,
    duration: '2160h',
    renewBefore: '360h',
    dnsNames: [`${faces}.${domain}.${tld}`],
    issuerRef: {
      name: 'letsencrypt-staging',
      kind: 'ClusterIssuer',
    }
  }
}, { provider: cluster.provider, dependsOn: certmanager.stagingClusterIssuer })

//export const dns = new cloudflare.Record('faces-thedevelopnik-com', {
//  name: 'faces',
//  zoneId: config.requireSecret('cloudflareZoneId'),
//  type: 'A',
//  value: emissary.externalIP,
//})
//
//export const host = new emissaryCRDs.v3alpha1.Host('faces-host', {
//  metadata: {
//    name: 'faces',
//    namespace: namespace.metadata.name,
//  },
//  spec: {
//    hostname: `${faces}.${domain}.${tld}`,
//    requestPolicy: {
//      insecure: {
//        action: 'Route',
//      }
//    }
//  }
//}, { provider: cluster.provider, dependsOn: [emissary.release, dns ] })

// secure host spec config
//  spec: {
//    hostname: `${faces}.${domain}.${tld}`,
//    tlsSecret: {
//      name: `${faces}-${domain}-${tld}`
//    },
//    requestPolicy: {
//      insecure: {
//        action: 'Redirect',
//      }
//    }
//  }

//export const guiMapping = new emissaryCRDs.v3alpha1.Mapping('faces-gui-mapping', {
//  metadata: {
//    name: 'faces-gui',
//    namespace: namespace.metadata.name,
//  },
//  spec: {
//    host: `${faces}.${domain}.${tld}`,
//    prefix: '/',
//    service: 'faces-gui.faces:80'
//  }
//}, {provider: cluster.provider, dependsOn: [ emissary.release, configFile, host ] })
//
//export const faceMapping = new emissaryCRDs.v3alpha1.Mapping('face-mapping', {
//  metadata: {
//    name: 'face',
//    namespace: namespace.metadata.name,
//  },
//  spec: {
//    host: `${faces}.${domain}.${tld}`,
//    prefix: '/face',
//    service: 'face.faces:80'
//  }
//}, {provider: cluster.provider, dependsOn: [ emissary.release, configFile, host ] })
//
//export const colorMapping = new emissaryCRDs.v3alpha1.Mapping('color-mapping', {
//  metadata: {
//    name: 'color',
//    namespace: namespace.metadata.name,
//  },
//  spec: {
//    host: `${faces}.${domain}.${tld}`,
//    prefix: '/color',
//    service: 'color.faces:80'
//  }
//}, {provider: cluster.provider, dependsOn: [ emissary.release, configFile, host ] })
//
//export const smileyMapping = new emissaryCRDs.v3alpha1.Mapping('smiley-mapping', {
//  metadata: {
//    name: 'smiley',
//    namespace: namespace.metadata.name,
//  },
//  spec: {
//    host: `${faces}.${domain}.${tld}`,
//    prefix: '/smiley',
//    service: 'smiley.faces:80'
//  }
//}, {provider: cluster.provider, dependsOn: [ emissary.release, configFile, host ] })

//export const productionCertificate = new certmanagerCRDs.v1.Certificate('faces-certificate-production', {
//  metadata: {
//    name: `${faces}-staging`,
//    namespace: faces,
//  },
//  spec: {
//    secretName: `${faces}-${domain}-${tld}-staging`,
//    duration: '2160h',
//    renewBefore: '360h',
//    dnsNames: [`${faces}.${domain}.${tld}`],
//    issuerRef: {
//      name: 'letsencrypt-production',
//      kind: 'ClusterIssuer',
//    }
//  }
//}, { provider: cluster.provider, dependsOn: certmanager.productionClusterIssuer })
