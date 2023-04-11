import * as k8s from '@pulumi/kubernetes'
import * as cloudflare from '@pulumi/cloudflare'
import * as cluster from '../cluster'
import config from '../config'
import { faces, domain, tld } from '../consts'
import * as emissaryCRDs from '../crds/emissary/getambassador/index'
import * as emissary from '../emissary'


export const namespace = new k8s.core.v1.Namespace('faces', {
  metadata: {
    name: 'faces',
  }
}, { provider: cluster.provider })

export const configFile = new k8s.yaml.ConfigFile('faces-app', {
  file: './faces/configfile/faces.yaml'
}, { provider: cluster.provider, dependsOn: namespace })

// secure host spec config
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
