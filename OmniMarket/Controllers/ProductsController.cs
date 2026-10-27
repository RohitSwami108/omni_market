using MediatR;
using Microsoft.AspNetCore.Mvc;
using OmniMarket.Application.Products.Commands;
using OmniMarket.Application.Products.Queries;
namespace OmniMarket.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : Controller {
    private readonly IMediator _mediator;
    public ProductsController(IMediator mediator) {
        _mediator = mediator;
    }
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand command) {
        Guid productId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetPaginated), new { id = productId }, productId);
    }
    [HttpGet]
    public async Task<IActionResult> GetPaginated([FromQuery] GetProductsWithPaginationQuery query) {
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id) {
        var isDeleted = await _mediator.Send(new DeleteProductCommand(id));
        if (!isDeleted) {
            return NotFound(new { message = $"Product with {id} was not found" });
        }
        return NoContent();
    }
}
