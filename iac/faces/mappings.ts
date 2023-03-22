import * as emissary from '../emissary'
import * as emissaryCRDs from '../crds/emissary/getambassador/index'
import * as cluster from '../cluster'
import { faces, domain, tld } from '../consts'
import { host } from './dns'
import { namespace, configFile } from './app'

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
