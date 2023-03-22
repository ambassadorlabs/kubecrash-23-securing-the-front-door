import * as cloudflare from '@pulumi/cloudflare'
import * as emissary from '../emissary'
import * as emissaryCRDs from '../crds/emissary/getambassador/index'
import * as cluster from '../cluster'
import config from '../config'
import {faces, domain, tld } from '../consts'
import { namespace } from './app'

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
