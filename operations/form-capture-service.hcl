job "form-capture-service" {
  datacenters = ["mb-hel"]
  type        = "service"

  group "form-capture-service-group" {
    count = 1

    network {
      mode = "bridge"
      port "http" {
        host_network = "wireguard"
      }
    }

    task "form-capture-service-task" {
      driver = "docker"

      config {
        image = "ghcr.io/memetic-block/form-capture-service:${VERSION}"
      }

      env {
        VERSION = "[[ .commit_sha ]]"
        PORT    = "${NOMAD_PORT_http}"
      }

      vault { policies = ["form-capture-service-gmail"] }

      template {
        data        = <<-EOF
        {{ with secret "kv/wuzzy/form-capture-service/gmail" }}
        GMAIL_USER="{{ .Data.data.GMAIL_USER }}"
        GMAIL_SERVICE_CLIENT="{{ .Data.data.GMAIL_SERVICE_CLIENT }}"
        GMAIL_PRIVATE_KEY="{{ .Data.data.GMAIL_PRIVATE_KEY }}"
        MAIL_FROM="{{ .Data.data.MAIL_FROM }}"
        MAIL_TO="{{ .Data.data.MAIL_TO }}"
        {{ end }}
        EOF
        destination = "secrets/config.env"
        env         = true
      }

      restart {
        attempts = 3
        interval = "5m"
        delay    = "15s"
        mode     = "delay"
      }

      resources {
        cpu    = 256
        memory = 256
      }

      service {
        name = "form-capture-service"
        port = "http"

        check {
          name     = "form-capture-service-http-check"
          type     = "http"
          path     = "/"
          interval = "10s"
          timeout  = "5s"
        }
      }
    }
  }
}
