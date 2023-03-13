import * as k8s from '@pulumi/kubernetes'
import * as cloudflare from '@pulumi/cloudflare'
import * as cluster from '../cluster'
import * as emissaryCRDs from '../crds/emissary/index'
import * as certmanagerCRDs from '../crds/certmanager/index'
import config from '../config'
import * as certmanager from '../certmanager'
import * as emissary from '../emissary'

const namespace = 'emojivoto'

export const install = new k8s.kustomize.Directory('emojivoto', {
  directory: 'https://github.com/BuoyantIO/emojivoto/tree/main/kustomize/deployment'
}, { provider: cluster.provider })

export const stagingCertificate = new certmanagerCRDs.certmanager.v1.Certificate('emojivoto-certificate-staging', {
  metadata: {
    name: `emojivoto`,
    namespace: namespace,
  },
  spec: {
    secretName: `emojivoto-developnik-com`,
    duration: '2160h',
    renewBefore: '360h',
    dnsNames: ['emojivoto.thedevelopnik.com'],
    issuerRef: {
      name: 'letsencrypt-staging',
      kind: 'ClusterIssuer',
    }
  }
}, { provider: cluster.provider, dependsOn: certmanager.stagingClusterIssuer })
