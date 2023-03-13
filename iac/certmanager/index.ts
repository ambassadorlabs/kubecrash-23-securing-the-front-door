import * as k8s from '@pulumi/kubernetes'
import * as cluster from '../cluster'

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
