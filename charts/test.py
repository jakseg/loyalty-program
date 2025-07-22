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
    """Create One-Time Setup Costs bar chart"""
    operations = ['Contract\nDeployment', 'Add Reward\nType', 'Set Merchant\nSigner']
    gas_values = [250000, 130000, 35000]
    colors = ['#C55A5A', '#808080', '#D2691E']
    
    fig, ax = plt.subplots(figsize=(8, 6))
    
    bars = ax.bar(operations, gas_values, color=colors, width=0.7)
    
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
    """Create Per Transaction Costs bar chart"""
    operations = ['Mint Basic\nToken', 'Mint Premium\nToken', 'Signature\nVerification', 'View\nFunctions']
    gas_values = [155000, 138000, 50000, 35000]
    colors = ['#C55A5A', '#808080', '#D2691E', '#4169E1']
    
    fig, ax = plt.subplots(figsize=(8, 6))
    
    bars = ax.bar(operations, gas_values, color=colors, width=0.6)
    
    ax.set_title('Per Transaction Costs', fontweight='bold', pad=20)
    ax.set_ylabel('Gas', fontweight='bold')
    ax.set_ylim(0, 180000)
    
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'{int(x):,}'))
    ax.set_yticks(range(0, 200000, 20000))
    
    ax.grid(True, axis='y', alpha=0.3, linestyle='-', linewidth=0.5)
    ax.set_axisbelow(True)
    
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    legend_labels = ['Mint Basic Token', 'Mint Premium Token', 'Signature Verification', 'View Functions']
    legend_elements = [mpatches.Patch(color=colors[i], label=legend_labels[i]) 
                      for i in range(len(operations))]
    ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(0.98, 0.98))
    
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

if __name__ == "__main__":
    main()