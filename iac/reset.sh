#! /usr/bin/env bash

kubectl apply -f platform/insecurehost.yaml
kubectl delete -f emissary/example-auth.yaml
kubectl delete -f faces/mappings.yaml
