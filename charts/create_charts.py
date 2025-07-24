import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import os

# Configure matplotlib for academic quality
plt.style.use('classic')
plt.rcParams.update({
    'font.family': 'serif',
    'font.serif': ['Times New Roman', 'Computer Modern Roman'],
    'font.size': 12,
    'axes.titlesize': 14,
    'axes.labelsize': 12,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 10,
    'figure.titlesize': 16,
    'text.usetex': False,
    'axes.linewidth': 0.8,
    'grid.linewidth': 0.5,
    'lines.linewidth': 1.5,
    'patch.linewidth': 0.5,
    'xtick.major.width': 0.8,
    'ytick.major.width': 0.8,
    'xtick.minor.width': 0.6,
    'ytick.minor.width': 0.6,
    'axes.edgecolor': 'black',
    'axes.grid': True,
    'grid.alpha': 0.3,
    'savefig.bbox': 'tight',
    'savefig.pad_inches': 0.1
})

def create_setup_costs_chart():
    """Create One-Time Setup Costs bar chart with updated values"""
    operations = ['Contract\nDeployment', 'Set Merchant\nSigner']
    gas_values = [249618, 34023]  # Updated values, removed "Add Reward Type"
    colors = ['#C55A5A', '#D2691E']
    
    fig, ax = plt.subplots(figsize=(8, 6))
    bars = ax.bar(operations, gas_values, color=colors, width=0.6)
    
    ax.set_title('One-Time Setup Costs', fontweight='bold', pad=20)
    ax.set_ylabel('Gas', fontweight='bold')
    ax.set_ylim(0, 300000)
    
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x):,}'))
    ax.set_yticks(range(0, 350000, 50000))
    
    ax.grid(True, axis='y', alpha=0.3, linestyle='-', linewidth=0.5)
    ax.set_axisbelow(True)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    legend_elements = [mpatches.Patch(color=colors[i], label=op.replace('\n', ' '))
                      for i, op in enumerate(operations)]
    ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(0.98, 0.98))
    
    plt.tight_layout()
    return fig

def create_transaction_costs_chart():
    """Create Per Transaction Costs bar chart with updated values"""
    operations = ['Mint Basic\nToken', 'Mint Premium\nToken', '10th Token\nMint', '100th Token\nMint']
    gas_values = [119635, 120093, 120105, 120105]  # Updated values
    colors = ['#C55A5A', '#808080', '#D2691E', '#4169E1']
    
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(operations, gas_values, color=colors, width=0.6)
    
    ax.set_title('Per Transaction Costs', fontweight='bold', pad=20)
    ax.set_ylabel('Gas', fontweight='bold')
    ax.set_ylim(0, 140000)
    
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x):,}'))
    ax.set_yticks(range(0, 150000, 20000))
    
    ax.grid(True, axis='y', alpha=0.3, linestyle='-', linewidth=0.5)
    ax.set_axisbelow(True)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    legend_labels = ['Mint Basic Token', 'Mint Premium Token', '10th Token Mint', '100th Token Mint']
    legend_elements = [mpatches.Patch(color=colors[i], label=legend_labels[i])
                      for i in range(len(operations))]
    ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(0.98, 0.98))
    
    plt.tight_layout()
    return fig

def create_minting_composition_chart():
    """Create Minting Composition breakdown chart"""
    components = ['Signature\nVerification', 'Ticket\nLookup', 'Core\nFunctionality']
    gas_values = [35701, 29804, 55987]  # Individual components
    colors = ['#C55A5A', '#808080', '#4169E1']
    
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(components, gas_values, color=colors, width=0.6)
    
    ax.set_title('Minting Cost Composition', fontweight='bold', pad=20)
    ax.set_ylabel('Gas', fontweight='bold')
    ax.set_ylim(0, 70000)  # Adjusted to fit the actual data better
    
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x):,}'))
    ax.set_yticks(range(0, 80000, 10000))
    
    ax.grid(True, axis='y', alpha=0.3, linestyle='-', linewidth=0.5)
    ax.set_axisbelow(True)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    legend_labels = ['Signature Verification', 'Ticket Lookup', 'Core Functionality']
    legend_elements = [mpatches.Patch(color=colors[i], label=legend_labels[i])
                      for i in range(len(components))]
    
    # Position legend to avoid overlapping with bars
    ax.legend(handles=legend_elements, loc='upper left', bbox_to_anchor=(0.02, 0.98))
    
    plt.tight_layout()
    return fig

def main():
    """Generate and save charts as PDF files"""
    output_dir = 'charts'
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate and save setup costs chart
    fig1 = create_setup_costs_chart()
    fig1.savefig(f'{output_dir}/setup_costs.pdf', bbox_inches='tight')
    plt.close(fig1)
    
    # Generate and save transaction costs chart
    fig2 = create_transaction_costs_chart()
    fig2.savefig(f'{output_dir}/transaction_costs.pdf', bbox_inches='tight')
    plt.close(fig2)
    
    # Generate and save minting composition chart
    fig3 = create_minting_composition_chart()
    fig3.savefig(f'{output_dir}/minting_composition.pdf', bbox_inches='tight')
    plt.close(fig3)
    
    print("Charts generated successfully!")
    print("Files created:")
    print("- charts/setup_costs.pdf")
    print("- charts/transaction_costs.pdf") 
    print("- charts/minting_composition.pdf")

if __name__ == "__main__":
    main()