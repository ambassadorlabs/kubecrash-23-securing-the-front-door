import * as k8s from '@pulumi/kubernetes'
import * as cluster from '../cluster'

export const install = new k8s.kustomize.Directory('emojivoto', {
  directory: 'https://github.com/BuoyantIO/emojivoto/tree/main/kustomize/deployment'
}, { provider: cluster.provider })
