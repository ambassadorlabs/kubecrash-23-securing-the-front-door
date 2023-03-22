import * as k8s from '@pulumi/kubernetes'
import * as cluster from '../cluster'
import { faces } from '../consts'

export const namespace = new k8s.core.v1.Namespace('faces', {
  metadata: {
    name: 'faces',
  }
}, { provider: cluster.provider })

export const configFile = new k8s.yaml.ConfigFile('faces-app', {
  file: './faces/configfile/faces.yaml'
}, { provider: cluster.provider, dependsOn: namespace })
