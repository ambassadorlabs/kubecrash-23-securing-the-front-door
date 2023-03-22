import * as k8s from '@pulumi/kubernetes'
import * as cluster from '../cluster'
import * as emissary from '../emissary'
import * as emissaryCRDs from '../crds/emissary/getambassador/index'
import * as certmanager from '../certmanager'
import * as certmanagerCRDs from '../crds/certmanager/certmanager/index'
import { faces, domain, tld } from '../consts'
import { namespace } from './app'
import { dns, host } from './dns'

//export const acmeService = new k8s.core.v1.Service('acme-challenge-service', {
//  metadata: {
//    name: 'acme-challenge',
//    namespace: namespace.metadata.name,
//    // this doesn't target any pods at creation so this tells Pulumi not to wait for it to do so
//    // pods are created on demand by cert-manager
//    annotations: {
//      'pulumi.com/skipAwait': 'true'
//    },
//  },
//  spec: {
//    ports: [
//      {
//        port: 80,
//        targetPort: 8089
//      }
//    ],
//    selector: {
//      'acme.cert-manager.io/http01-solver': 'true'
//    }
//  }
//}, { provider: cluster.provider })
//
//export const acmeMapping = new emissaryCRDs.v3alpha1.Mapping('acme-challenge-mapping', {
//  metadata: {
//    name: 'acme-challenge',
//    namespace: namespace.metadata.name,
//  },
//  spec: {
//    hostname: '*',
//    prefix: '/.well-known/acme-challenge/',
//    rewrite: '',
//    service: 'acme-challenge.faces',
//  }
//}, { provider: cluster.provider, dependsOn: [dns, acmeService, emissary.crds] })

// used for testing cert-manager issuer configuration before we mess it up and
// go through the rate limit on the production server
//export const stagingCertificate = new certmanagerCRDs.v1.Certificate('faces-certificate-staging', {
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
//      name: 'letsencrypt-http-staging',
//      kind: 'ClusterIssuer',
//    }
//  }
//}, { provider: cluster.provider, dependsOn: [certmanager.stagingHttpClusterIssuer, dns, acmeService, acmeMapping, host] })
//
//export const productionCertificate = new certmanagerCRDs.v1.Certificate('faces-certificate-production', {
//  metadata: {
//    name: `${faces}`,
//    namespace: faces,
//  },
//  spec: {
//    secretName: `${faces}-${domain}-${tld}`,
//    duration: '2160h',
//    renewBefore: '360h',
//    dnsNames: [`${faces}.${domain}.${tld}`],
//    issuerRef: {
//      name: 'letsencrypt-http-production',
//      kind: 'ClusterIssuer',
//    }
//  }
//}, { provider: cluster.provider, dependsOn: [certmanager.productionHttpClusterIssuer, dns, acmeService, acmeMapping, host] })
