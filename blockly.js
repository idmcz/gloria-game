// ─────────────────────────────────────────────────────────────────────────────
// blockly.js — Blockly workspace, custom blocks, and block limits
//
// IMPORTANT: Blockly workspace injection is DEFERRED until the game screen is
// visible (Play button clicked), so the container has real dimensions.
// Call window._initBlockly() after revealing #game-screen.
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', function () {

  // ── 1. Block SHAPES — register these immediately (no DOM dependency) ─────────

  // ── Hat block: "When RUN is clicked" ─────────────────────────────────────
  Blockly.Blocks['gloria_when_run'] = {
    init: function () {
      this.appendDummyInput().appendField('🟢 When RUN is clicked');
      this.setNextStatement(true, null);   // blocks connect below, nothing above
      this.setColour('#2e7d32');
      this.setTooltip('Your code runs from here when you press RUN!');
      this.setDeletable(false);
      this.setMovable(false);
    }
  };
  Blockly.JavaScript.forBlock['gloria_when_run'] = () => '';  // generates no code

  Blockly.Blocks['gloria_move_forward'] = {
    init: function () {
      this.appendDummyInput().appendField('🐾 Gloria Move Forward');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#E91E8C');
      this.setTooltip('Moves Gloria one step forward');
    }
  };

  Blockly.Blocks['gloria_jump'] = {
    init: function () {
      this.appendDummyInput().appendField('⬆️ Gloria Jump');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9C27B0');
      this.setTooltip('Makes Gloria jump over an obstacle');
    }
  };

  Blockly.Blocks['gloria_duck'] = {
    init: function () {
      this.appendDummyInput().appendField('⬇️ Gloria Duck');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0288d1');
      this.setTooltip('Makes Gloria duck under a puddle');
    }
  };

  Blockly.Blocks['gloria_kick'] = {
    init: function () {
      this.appendDummyInput().appendField('🦵 Gloria Kick');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e65100');
      this.setTooltip('Makes Gloria kick a box out of the way');
    }
  };

  Blockly.Blocks['gloria_next_row'] = {
    init: function () {
      this.appendDummyInput().appendField('⬇️ Move to Next Row');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#00838f');
      this.setTooltip('Drops Gloria down to the start of the next row');
    }
  };

  Blockly.Blocks['gloria_repeat'] = {
    init: function () {
      this.appendValueInput('TIMES')
          .setCheck('Number')
          .appendField('🔁 Repeat');
      this.appendStatementInput('DO').appendField('do');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF6F00');
      this.setTooltip('Repeat the blocks inside this many times');
    }
  };

  // ── 2. Code generators ────────────────────────────────────────────────────────

  Blockly.JavaScript.forBlock['gloria_move_forward'] = () => 'gloriaMove();\n';
  Blockly.JavaScript.forBlock['gloria_jump']         = () => 'gloriaJump();\n';
  Blockly.JavaScript.forBlock['gloria_duck']         = () => 'gloriaDuck();\n';
  Blockly.JavaScript.forBlock['gloria_kick']         = () => 'gloriaKick();\n';
  Blockly.JavaScript.forBlock['gloria_next_row']     = () => 'gloriaNextRow();\n';

  Blockly.JavaScript.forBlock['gloria_repeat'] = function (block) {
    const times = Blockly.JavaScript.valueToCode(block, 'TIMES', Blockly.JavaScript.ORDER_ATOMIC) || '2';
    const body  = Blockly.JavaScript.statementToCode(block, 'DO');
    return `for (let _i = 0; _i < ${times}; _i++) {\n${body}}\n`;
  };

  // ── 3. Deferred workspace injection ──────────────────────────────────────────
  // Called by game.js AFTER #game-screen is made visible (play button click).

  window._initBlockly = function () {
    if (window._blocklyWorkspace) return; // already injected

    const workspace = Blockly.inject('blockly-workspace', {
      toolbox: document.getElementById('toolbox'),
      scrollbars: true,
      trashcan: true,
      grid: { spacing: 20, length: 3, colour: '#e0ccff', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.9 }
    });

    window._blocklyWorkspace = workspace;

    // ── Insert permanent "When RUN is clicked" hat block ──────────────────────
    const hatXml = Blockly.utils.xml.textToDom(
      '<xml><block type="gloria_when_run" x="20" y="20" deletable="false" movable="false"></block></xml>'
    );
    Blockly.Xml.domToWorkspace(hatXml, workspace);

    // ── 4. Block limit enforcement ──────────────────────────────────────────────

    const limitWarning = document.getElementById('limit-warning');

    const BLOCK_TYPES = {
      gloria_move_forward: 'move',
      gloria_jump:         'jump',
      gloria_duck:         'duck',
      gloria_kick:         'kick',
      gloria_next_row:     'nextrow',
    };

    function enforceBlockLimits() {
      const limits = window.MOVE_LIMITS || { move: 999, jump: 999, duck: 999, kick: 999, nextrow: 999 };
      const allBlocks = workspace.getAllBlocks(false);
      let warned = false;

      for (const [blockType, limitKey] of Object.entries(BLOCK_TYPES)) {
        const limit = limits[limitKey] ?? 999;
        if (limit >= 999) continue;
        const ofType = allBlocks.filter(b => b.type === blockType);
        if (ofType.length > limit) {
          ofType.slice(limit).forEach(b => b.dispose());
          warned = true;
        }
      }

      if (warned && limitWarning) {
        const lims = Object.entries(BLOCK_TYPES)
          .filter(([, k]) => (limits[k] ?? 999) < 999)
          .map(([, k]) => `1 ${k}`)
          .join(', ');
        limitWarning.textContent = `⚠️ Only ${lims} block(s) allowed! Use 🔁 Repeat!`;
        limitWarning.style.display = 'block';
        clearTimeout(limitWarning._timer);
        limitWarning._timer = setTimeout(() => { limitWarning.style.display = 'none'; }, 3500);
      }
    }

    workspace.addChangeListener(function (e) {
      if (e.type === Blockly.Events.BLOCK_CREATE || e.type === Blockly.Events.BLOCK_MOVE) {
        enforceBlockLimits();
      }
    });

    window.updateBlockLimits = () => enforceBlockLimits();

    // ── 4b. Per-level toolbox: hide Move Forward for levels 2+ ─────────────────
    const TOOLBOX_WITH_MOVE = `<xml>
      <category name="Gloria's Moves" colour="#E91E8C">
        <block type="gloria_move_forward"></block>
        <block type="gloria_jump"></block>
        <block type="gloria_duck"></block>
        <block type="gloria_kick"></block>
        <block type="gloria_next_row"></block>
      </category>
      <category name="Loops" colour="#FF6F00">
        <block type="gloria_repeat">
          <value name="TIMES">
            <block type="math_number"><field name="NUM">5</field></block>
          </value>
        </block>
      </category>
    </xml>`;

    const TOOLBOX_NO_MOVE = `<xml>
      <category name="Gloria's Moves" colour="#E91E8C">
        <block type="gloria_jump"></block>
        <block type="gloria_duck"></block>
        <block type="gloria_kick"></block>
        <block type="gloria_next_row"></block>
      </category>
      <category name="Loops" colour="#FF6F00">
        <block type="gloria_repeat">
          <value name="TIMES">
            <block type="math_number"><field name="NUM">5</field></block>
          </value>
        </block>
      </category>
    </xml>`;

    window.updateToolboxForLevel = function(levelNum) {
      // Move Forward only appears in Level 1 (walking lesson)
      const xml = levelNum === 1 ? TOOLBOX_WITH_MOVE : TOOLBOX_NO_MOVE;
      workspace.updateToolbox(xml);
    };

    // ── 5. RUN button ───────────────────────────────────────────────────────────

    document.getElementById('run-btn').addEventListener('click', function () {
      if (window.GameAudio) window.GameAudio.click();  // unlock audio + click sound

      // Only run code attached to the "When RUN is clicked" hat block.
      // workspaceToCode() would include floating/disconnected blocks too.
      const hatBlock = workspace.getAllBlocks(false).find(b => b.type === 'gloria_when_run');
      let code = '';
      if (hatBlock && hatBlock.getNextBlock()) {
        code = Blockly.JavaScript.blockToCode(hatBlock.getNextBlock());
      }

      console.clear();
      console.log('─── Generated Code ───\n', code, '\n──────────────────────');
      if (typeof window.runGloriaCode === 'function') {
        window.runGloriaCode(code);
      } else {
        console.warn('runGloriaCode() not found!');
      }
    });
  };

});
