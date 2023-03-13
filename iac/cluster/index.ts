import * as k8s from '@pulumi/kubernetes'

export const provider = new k8s.Provider('kubecrash-cluster', {
  kubeconfig: '/Users/davesudia/.kube/config',
  cluster: 'kubecrash',
  context: 'kubecrash'
})
