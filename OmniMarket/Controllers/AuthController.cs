using MediatR;
using Microsoft.AspNetCore.Mvc;
using OmniMarket.Application.Authentication;
namespace OmniMarket.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : Controller {
    public readonly IMediator _mediator;
    public AuthController(IMediator mediator) {
        _mediator = mediator;
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command) {
        try {
            var userId = await _mediator.Send(command);
            return Ok(new { id = userId, message = "Registration completed successfully." });
        }catch (ArgumentException ex) {
            return BadRequest(new { error = ex.Message });
        }
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginQuery query) {
        try {
            var token = _mediator.Send(query);
            return Ok(new { token, message = "Authentication success" });
        }catch(UnauthorizedAccessException ex) {
            return Unauthorized(new { error = ex.Message });
        }
    }
}
