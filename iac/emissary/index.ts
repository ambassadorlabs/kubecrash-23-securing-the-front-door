import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import * as cluster from '../cluster'

const namespace = new k8s.core.v1.Namespace('ambassador', {
  metadata: {
    name: 'ambassador',
  }
}, { provider: cluster.provider })

// The emissary-ingress chart does not install its own crds so we are installing them ourselves
export const crds = new k8s.yaml.ConfigFile('emissary-ingress-3-crds', {
  file: './emissary/emissary-crds.yaml',
}, { provider: cluster.provider })

export const release = new k8s.helm.v3.Release('emissary-ingress', {
  chart: 'emissary-ingress',
  version: '8.5.1',
  namespace: namespace.metadata.name,
  repositoryOpts: {
    repo: 'https://app.getambassador.io'
  },
  values: {
    createDefaultListeners: true,
  }
}, { provider: cluster.provider, dependsOn: crds })

const svc = k8s.core.v1.Service.get('emissary-ingress-svc', pulumi.interpolate`${namespace.metadata.name}/${release.status.name}`)
export const externalIP = svc.status.loadBalancer.ingress[0].ip
