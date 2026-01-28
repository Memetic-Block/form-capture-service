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
        VERSION   = "[[ .commit_sha ]]"
        PORT      = "${NOMAD_PORT_http}"
        SMTP_HOST = "smtp.gmail.com"
        SMTP_PORT = 465
      }

      vault { policies = ["memeticblock-form-capture-service"] }

      template {
        data        = <<-EOF
        {{- with secret "kv/memeticblock/form-capture-service" }}
        SMTP_USER="{{ .Data.data.SMTP_USER }}"
        SMTP_PASS="{{ .Data.data.SMTP_PASS }}"
        MAIL_FROM="{{ .Data.data.MAIL_FROM }}"
        MAIL_TO="{{ .Data.data.MAIL_TO }}"
        {{- end }}
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
        tags = [
          "logging",          
          "traefik.enable=true",
          "traefik.http.routers.api-live.rule=Host(`forms.memeticblock.com`)",
          "traefik.http.routers.api-live.entrypoints=https",
          "traefik.http.routers.api-live.tls=true",
          "traefik.http.routers.api-live.tls.certresolver=memetic-block",
          "traefik.http.routers.api-live.middlewares=form-capture-service-ratelimit",
          "traefik.http.middlewares.form-capture-service-ratelimit.ratelimit.average=10"
        ]
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
