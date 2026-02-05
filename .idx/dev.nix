{ pkgs, ... }: {
  # Let Project IDX know you're running a web server.
  # services.http.port = 8080;

  # The following are examples of how you can use Project IDX to customize your
  # development environment.

  # The following configures a web server to be proxied by IDX.
  # previews = [
  #   {
  #     # The port your web server will listen on.
  #     port = 8080;
  #     # How to start your web server.
  #     command = ["npm" "run" "dev"];
  #   }
  # ];

  # These are the channels where you can install packages from.
  channels.nixpkgs = "unstable";

  # These are the packages that will be available in your environment.
  packages = [
    pkgs.nodejs_20
  ];

  # Use this to run a command when your environment is created.
  # Recommended for tasks that only need to run once, such as database migrations.
  # onCreate = {
  #   # Example: install JS dependencies from NPM
  #   npm-install = "npm install";
  # };

  # Use this to run a command when your environment is started.
  # Recommended for tasks that need to run continuously, such as a file watcher.
  # onStart = {
  #   # Example: start a background task to watch and re-build backend code
  #   watch-backend = "npm run watch-backend";
  # };

  # The following are some more examples of what you can do with your
  # Project IDX environment.
  #
  # # Open editors for the following files by default, if they exist
  # default.openFiles = [ "src/index.js" ];
  #
  # # Set environment variables
  # env = {
  #   API_KEY = "your_api_key";
  # };
  #
  # # Forward a port
  # ports."8888".origin = "localhost:8888";
}