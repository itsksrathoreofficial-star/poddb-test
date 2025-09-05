{ pkgs ? import <nixpkgs> {} }: {
  channel = "unstable";
  packages = [
    pkgs.nodejs_20
    pkgs.supabase-cli
    pkgs.docker
    pkgs.sudo
    pkgs.doas
    pkgs.systemd
    pkgs.podman  # Added for rootless container support
  ];
  idx.extensions = [];
  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--hostname"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}