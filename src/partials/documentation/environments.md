### Local Development Environments

When running `orison serve`, any changes to any src file will automatically
be reflected at localhost:3000.

### Production Environments

The preferred method of running a production environment is to statically serve
the files built with `orison build`. Most hosting platforms are capable of this.
Otherwise running `orison static` will simply make the docs directory available, and
so any changes to the src directory will require a `orison build` before being
available. This `orison static` command can also be used to preview the built changes
before deploying to some other hosting platform.

When running `orison serve` with process.env.NODE_ENV set to 'production'
the node module cache clearing is removed and changes to JavaScript files
under the src directory will require restarting the server.
