using Microsoft.EntityFrameworkCore;
using FluentValidation;
using OmniMarket.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// 1. Keep your configuration block here
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:5218")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
//builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseInMemoryDatabase("OmniMarketDb"));
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("DefaultConnection")
));
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "OmniMarkup API v1"));
}

// 2. ACTIVATE THE CORS MIDDLEWARE HERE (Must go before HttpsRedirection/Authorization)
app.UseCors("AllowAngularDev");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
