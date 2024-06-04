// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using IdentityModel;
using IdentityServer.Helpers;
using IdentityServer4;
using IdentityServer4.Models;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Net;

namespace IdentityServer
{
    public static class Config
    {
        public static IEnumerable<IdentityResource> IdentityResources =>
                   new IdentityResource[]
                   {
                new IdentityResources.OpenId(),
                new ProfileWithRoleIdentityResource(),
                new IdentityResources.Email(),
                   };

        public static IEnumerable<ApiScope> ApiScopes =>
            new ApiScope[]
            {
                new ApiScope("posts-api", "Posts API", new List<string>(){ JwtClaimTypes.Role, JwtClaimTypes.Name }),
                new ApiScope("users-api", "Users API", new List<string>(){ JwtClaimTypes.Role, JwtClaimTypes.Name }),
            };

        public static IEnumerable<Client> Clients(IConfiguration configuration)
        {
            var reactClientUrl = configuration.GetValue<string>("REACT_APP_CLIENT_URL");
            var postsApiUrl = configuration.GetValue<string>("REACT_APP_API_URL");
            return new Client[]
            {
                new Client
                {
                    ClientId = "react.client",
                    ClientName = "React Client",
                    ClientUri = reactClientUrl,
                    ClientSecrets = { new Secret("secret".Sha256()) },

                    AllowedGrantTypes = GrantTypes.ResourceOwnerPassword,

                    RequireConsent = false,

                    AllowedScopes = {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Profile,
                        IdentityServerConstants.StandardScopes.Email,
                        "posts-api",
                        "users-api"
                    },

                    AllowedCorsOrigins = { reactClientUrl, postsApiUrl },

                    AllowAccessTokensViaBrowser = true
                }
            };
        }
    }
}