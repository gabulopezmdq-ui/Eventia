// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using System;
using System.Linq;
using System.Security.Claims;
using IdentityModel;
using IdentityServer.Data;
using IdentityServer.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace IdentityServer
{
    public class SeedData
    {
        public static void EnsureSeedData(string connectionString)
        {
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddDbContext<ApplicationDbContext>(options =>
               options.UseSqlite(connectionString));

            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            using (var serviceProvider = services.BuildServiceProvider())
            {
                using (var scope = serviceProvider.GetRequiredService<IServiceScopeFactory>().CreateScope())
                {
                    var context = scope.ServiceProvider.GetService<ApplicationDbContext>();
                    context.Database.Migrate();

                    var adminClaim = new Claim("Roles", "admin");
                    var memberClaim = new Claim("Roles", "member");
                    var creatorClaim = new Claim("Roles", "creator"); ;

                    #region roles
                    string adminrolename = "admin";
                    string memberrolename = "member";
                    string creatorrolename = "creator";

                    var roleMgr = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

                    var admin = roleMgr.FindByNameAsync(adminrolename).Result;
                    if (admin == null)
                    {
                        admin = new IdentityRole(adminrolename);
                        var result = roleMgr.CreateAsync(admin).Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }
                        Log.Debug($"{adminrolename} role created");
                    }
                    var member = roleMgr.FindByNameAsync(memberrolename).Result;
                    if (member == null)
                    {
                        member = new IdentityRole(memberrolename);
                        var result = roleMgr.CreateAsync(member).Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }
                        Log.Debug($"{memberrolename} role created");
                    }

                    var creator = roleMgr.FindByNameAsync(creatorrolename).Result;
                    if (creator == null)
                    {
                        creator = new IdentityRole(creatorrolename);
                        var result = roleMgr.CreateAsync(creator).Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }
                        Log.Debug($"{creatorrolename} role created");
                    }

                    #endregion
                    
                    
                    #region users

                    var userMgr = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                    var alice = userMgr.FindByNameAsync("alice").Result;
                    if (alice == null)
                    {
                        alice = new ApplicationUser
                        {
                            UserName = "alice",
                            Email = "AliceSmith@email.com",
                            EmailConfirmed = true,
                        };
                        var result = userMgr.CreateAsync(alice, "Pass123$").Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }

                        result = userMgr.AddClaimsAsync(alice, new Claim[]{
                            new Claim(JwtClaimTypes.Name, "Alice Smith"),
                            new Claim(JwtClaimTypes.GivenName, "Alice"),
                            new Claim(JwtClaimTypes.FamilyName, "Smith"),
                            new Claim(JwtClaimTypes.WebSite, "http://alice.com"), 
                            adminClaim,
                        }).Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }
                        //add alice to admin role
                        userMgr.AddToRoleAsync(alice, adminrolename);
                        userMgr.AddToRoleAsync(alice, memberrolename);
                        
                        Log.Debug("alice created");
                    }
                    else
                    {
                        Log.Debug("alice already exists");
                    }

                    var bob = userMgr.FindByNameAsync("bob").Result;
                    if (bob == null)
                    {
                        bob = new ApplicationUser
                        {
                            UserName = "bob",
                            Email = "BobSmith@email.com",
                            EmailConfirmed = true
                        };
                        var result = userMgr.CreateAsync(bob, "Pass123$").Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }
                        result = userMgr.AddClaimsAsync(bob, new Claim[]{
                            new Claim(JwtClaimTypes.Name, "Bob Smith"),
                            new Claim(JwtClaimTypes.GivenName, "Bob"),
                            new Claim(JwtClaimTypes.FamilyName, "Smith"),
                            new Claim(JwtClaimTypes.WebSite, "http://bob.com"),
                            new Claim("location", "somewhere"),
                            memberClaim
                        }).Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }

                        //add bob to member role
                        userMgr.AddToRoleAsync(bob, memberrolename);

                        Log.Debug("bob created");
                    }
                    else
                    {
                        Log.Debug("bob already exists");
                    }

                    var fred = userMgr.FindByNameAsync("fred").Result;
                    if (fred == null)
                    {
                        fred = new ApplicationUser
                        {
                            UserName = "fred",
                            Email = "fredjones@email.com",
                            EmailConfirmed = true
                        };
                        var result = userMgr.CreateAsync(fred, "Pass123$").Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }
                        result = userMgr.AddClaimsAsync(fred, new Claim[]{
                            new Claim(JwtClaimTypes.Name, "Fred Jones"),
                            new Claim(JwtClaimTypes.GivenName, "Fred"),
                            new Claim(JwtClaimTypes.FamilyName, "Jones"),
                            new Claim(JwtClaimTypes.WebSite, "http://fred.com"),
                            new Claim("location", "somewhere"),
                            creatorClaim
                        }).Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }

                        //add fred to creator role
                        userMgr.AddToRoleAsync(fred, creatorrolename);
                        userMgr.AddToRoleAsync(fred, memberrolename);

                        Log.Debug("fred created");
                    }
                    else
                    {
                        Log.Debug("fred already exists");
                    }

                    #endregion

                    Log.Debug($"Admin Users { string.Join(", ", userMgr.GetUsersInRoleAsync(adminrolename).Result.Select(s => s.UserName)) }");

                    Log.Debug($"Creator Users { string.Join(", ", userMgr.GetUsersInRoleAsync(creatorrolename).Result.Select(s => s.UserName)) }");
                }
            }
        }
    }
}
