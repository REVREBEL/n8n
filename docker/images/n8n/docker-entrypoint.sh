#!/bin/sh
if [ "$#" -gt 0 ]; then
  # Got started with arguments
  n8n "$@"
else
  # Got started without arguments
  exec n8n
fi
